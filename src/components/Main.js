import * as ChessJS from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import Chessground from "react-chessground";
import styled from "styled-components";
import { getCloudEval, getRandomOpeningMove } from "../utils";

const DATABASE_SPEEDS = {
  ultraBullet: "Ultrabullet",
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rapid",
  classical: "Classical",
  correspondence: "Correspondence",
};

const DATABASE_RATINGS = ["1600", "1800", "2000", "2200", "2500"];

const FormHeaderLabel = styled(Form.Label)`
  font-weight: bold;
`;

const Main = () => {
  const [isWhite, setIsWhite] = useState(true);
  const [startingColorIsWhite, setStartingColorIsWhite] = useState(true);
  const [selectedDatabaseSpeeds, setSelectedDatabaseSpeeds] = useState([
    "ultraBullet",
    "bullet",
    "blitz",
    "rapid",
    "classical",
    "correspondence",
  ]);
  const [selectedDatabaseRatings, setSelectedDatabaseRatings] = useState([
    "1600",
    "1800",
    "2000",
    "2200",
    "2500",
  ]);
  const [totalGamesThreshold, setTotalGamesThreshold] = useState(100);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState(
    "Make moves on the chessboard to set starting position."
  );
  const [fen, setFen] = useState("");
  const [initialFen, setInitialFen] = useState("");
  const [lastMove, setLastMove] = useState();
  const [done, setDone] = useState(false);

  const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;
  const chessRef = useRef(Chess());
  const chess = chessRef.current;

  const makeComputerMove = useCallback(async () => {
    if (chess.turn() === (isWhite ? "w" : "b")) {
      setMessage("It is your turn!");
      return;
    }

    setMessage("Loading...");
    const [cloudEval, randomOpeningMove] = await Promise.all([
      getCloudEval(chess.fen()),
      getRandomOpeningMove(chess.fen(), {
        speeds: selectedDatabaseSpeeds,
        ratings: selectedDatabaseRatings,
      }),
    ]);
    if (randomOpeningMove === null) {
      setMessage(`Eval: ${cloudEval}; this is a novelty`);
      setDone(true);
      return;
    }
    const { san, moveCount, probability } = randomOpeningMove;

    const { from, to } = chess.move(san);
    setFen(chess.fen());
    setLastMove([from, to]);

    const message = `Eval: ${cloudEval}; made move ${san} (${moveCount} positions, probability ${(
      probability * 100
    ).toFixed(2)}%).`;

    if (moveCount < totalGamesThreshold) {
      setDone(true);
      setMessage(`${message} Training is over. PGN: ${chess.pgn()}`);
    } else {
      setMessage(message);
    }
  }, [selectedDatabaseRatings, selectedDatabaseSpeeds, chess, isWhite]);

  useEffect(() => {
    (async () => {
      if (!started) {
        return;
      }
      makeComputerMove();
    })();
  }, [
    started,
    selectedDatabaseRatings,
    selectedDatabaseSpeeds,
    makeComputerMove,
  ]);

  const dests = new Map();
  if (started) {
    for (const sq of chess.SQUARES) {
      const moves = chess.moves({ square: sq, verbose: true });
      if (moves.length > 0) {
        dests.set(
          sq,
          moves.map(({ to }) => to)
        );
      }
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <Chessground
            fen={fen}
            viewOnly={done}
            orientation={isWhite ? "white" : "black"}
            lastMove={lastMove}
            highlight={{ lastMove: started, check: started }}
            movable={{ free: !started, dests }}
            onMove={(from, to) => {
              if (!started) {
                chess.put(chess.get(from), to);
                chess.remove(from);
                setFen(chess.fen());
              } else {
                chess.move({ from, to });
                setFen(chess.fen());
                makeComputerMove();
              }
            }}
          />
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <div>{message}</div>
              <Form>
                <Form.Group>
                  <FormHeaderLabel>Color</FormHeaderLabel>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      id="radio-color-white"
                      name="radio-group-color"
                      label="White"
                      checked={isWhite}
                      onChange={() => setIsWhite(true)}
                      disabled={started}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="radio-color-black"
                      name="radio-group-color"
                      label="Black"
                      checked={!isWhite}
                      onChange={() => setIsWhite(false)}
                      disabled={started}
                    />
                  </div>
                </Form.Group>
                <Form.Group>
                  <FormHeaderLabel>Starting Color</FormHeaderLabel>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      id="radio-starting-color-white"
                      name="radio-group-starting-color"
                      label="White"
                      checked={startingColorIsWhite}
                      onChange={() => setStartingColorIsWhite(true)}
                      disabled={started}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="radio-starting-color-black"
                      name="radio-group-starting-color"
                      label="Black"
                      checked={!startingColorIsWhite}
                      onChange={() => setStartingColorIsWhite(false)}
                      disabled={started}
                    />
                  </div>
                </Form.Group>
                <Form.Group>
                  <FormHeaderLabel>Database speeds</FormHeaderLabel>
                  <div>
                    {Object.entries(DATABASE_SPEEDS).map(
                      ([apiValue, label]) => (
                        <Form.Check
                          key={apiValue}
                          inline
                          type="checkbox"
                          id={`checkbox-database-speed-${apiValue}`}
                          label={label}
                          checked={selectedDatabaseSpeeds.includes(apiValue)}
                          onChange={({ target: { checked } }) =>
                            setSelectedDatabaseSpeeds((curr) =>
                              checked
                                ? curr.concat(apiValue)
                                : curr.filter((val) => val !== apiValue)
                            )
                          }
                          disabled={started}
                        />
                      )
                    )}
                  </div>
                </Form.Group>
                <Form.Group>
                  <FormHeaderLabel>Database ratings</FormHeaderLabel>
                  <div>
                    {DATABASE_RATINGS.map((value) => (
                      <Form.Check
                        key={value}
                        inline
                        type="checkbox"
                        id={`checkbox-database-rating-${value}`}
                        label={value}
                        checked={selectedDatabaseRatings.includes(value)}
                        onChange={({ target: { checked } }) =>
                          setSelectedDatabaseRatings((curr) =>
                            checked
                              ? curr.concat(value)
                              : curr.filter((val) => val !== value)
                          )
                        }
                        disabled={started}
                      />
                    ))}
                  </div>
                </Form.Group>
                <Form.Group>
                  <FormHeaderLabel>Total Games Threshold</FormHeaderLabel>
                  <Form.Control
                    value={totalGamesThreshold.toString()}
                    onChange={({ target: { value } }) =>
                      setTotalGamesThreshold(Number(value))
                    }
                    disabled={started}
                  />
                </Form.Group>
                <ButtonGroup>
                  {!started && (
                    <Button
                      variant="primary"
                      className="mt-3"
                      onClick={() => {
                        if (!startingColorIsWhite) {
                          const splitFen = fen.split(" ");
                          const newFen = splitFen
                            .slice(0, 1)
                            .concat("b")
                            .concat(splitFen.slice(2))
                            .join(" ");
                          chessRef.current = Chess(newFen);
                          setFen(newFen);
                          setInitialFen(newFen);
                        } else {
                          setInitialFen(fen);
                        }

                        setStarted(true);
                      }}
                    >
                      Start
                    </Button>
                  )}
                  {started && (
                    <Button
                      variant="secondary"
                      className="mt-3"
                      onClick={() => {
                        setFen(initialFen);
                        chessRef.current = Chess(initialFen);
                        makeComputerMove();
                        setDone(false);
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </ButtonGroup>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Main;

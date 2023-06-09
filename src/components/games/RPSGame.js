import React, { useEffect, useState } from 'react';
import 'styles/games/RPSGame.scss';
import { ActivationState } from "@stomp/stompjs";
import { WebSocketContext } from "App";
import { useContext } from "react";
import { LobbyContext, MinigameContext } from "components/routing/routers/AppRouter";
import { useHistory } from "react-router-dom";
import PlayerContainer from "components/ui/PlayerContainer";
import { Timer } from "components/ui/Timer";
export const RPSGame = () => {
  const [playerOneChoice, setPlayerOneChoice] = useState("hold");
  const [playerTwoChoice, setPlayerTwoChoice] = useState("hold");
  const [playerOneDecision, setPlayerOneDecision] = useState(null);
  const [playerTwoDecision, setPlayerTwoDecision] = useState(null);
  const [winnerEachRound, setWinnerEachRound] = useState(null);
  const [score, setScore] = useState({ playerOne: 0, playerTwo: 0 });

  const history = useHistory();

  const choices = ['rock', 'paper', 'scissors'];

  const connections = useContext(WebSocketContext);
  const lobbyContext = useContext(LobbyContext);
  const minigameContext = useContext(MinigameContext);

  const WINNING_SCORE = 3;

  // determine winner for each round
  const determineWinner = (playerOneChoice, playerTwoChoice) => {
    if (playerOneChoice === playerTwoChoice) {
      setWinnerEachRound('tie');
    } else if (
      (playerOneChoice === 'rock' && playerTwoChoice === 'scissors') ||
      (playerOneChoice === 'paper' && playerTwoChoice === 'rock') ||
      (playerOneChoice === 'scissors' && playerTwoChoice === 'paper')
    ) {
      setScore({ playerOne: score.playerOne + 1, playerTwo: score.playerTwo });
      setWinnerEachRound('playerOne');
    } else {
      setScore({ playerOne: score.playerOne, playerTwo: score.playerTwo + 1 });
      setWinnerEachRound('playerTwo');
    }
  };

  const onPlayerOneInput = (msg) => {
    const data = JSON.parse(msg.body);
    if (data.inputType === 'RPS') {
      setPlayerOneDecision(choices[data.rawData.x]);
    }
  };

  const onPlayerTwoInput = (msg) => {
    const data = JSON.parse(msg.body);
    if (data.inputType === 'RPS') {
      setPlayerTwoDecision(choices[data.rawData.x]);
    }
  };

  // store player score in local storage
  useEffect(() => {
    localStorage.setItem('score', JSON.stringify(score));
  }, [score]);

  // retrieve player score from local storage
  useEffect(() => {
    const score = JSON.parse(localStorage.getItem('score'));
    if (score) {
      setScore(score);
    }
  }, []);


  // determine winner after both players have made a choice
  useEffect(() => {
    if (playerOneDecision && playerTwoDecision) {
      setPlayerOneChoice(playerOneDecision);
      setPlayerTwoChoice(playerTwoDecision);
      setPlayerOneDecision(null);
      setPlayerTwoDecision(null);
      determineWinner(playerOneDecision, playerTwoDecision);
    }
  }, [playerOneDecision, playerTwoDecision]);

  // display winner
  useEffect(() => {
    if (winnerEachRound) {
      setTimeout(() => {
        setPlayerOneChoice("hold");
        setPlayerTwoChoice("hold");
        setWinnerEachRound(null);
      }, 2000);
    }
  }, [winnerEachRound]);

  // redircet to winning page when game is over
  useEffect(() => {
    if (score.playerOne === WINNING_SCORE || score.playerTwo === WINNING_SCORE) {
      const scoreToGain = minigameContext.minigame.scoreToGain;
      const total = score.playerOne + score.playerTwo;
      const winnerScore = Math.round(WINNING_SCORE / total * scoreToGain); 
      const winningTeam = score.playerOne === WINNING_SCORE ? { type: "TEAM_ONE", name: lobbyContext.lobby.teams[0].name } : { type: "TEAM_TWO", name: lobbyContext.lobby.teams[1].name };
      const winner = { score: winnerScore, type: winningTeam.type, name: winningTeam.name }
      const loser = { score: scoreToGain - winnerScore}
      const isDraw = false;
      setTimeout(() => {
        history.push("/minigameWon", { winner, loser, isDraw })
      }, 1000);
    }
  }, [score]);

  // websocket connection
  useEffect(() => {
    if (connections.stompConnection.state === ActivationState.ACTIVE) {
      connections.stompConnection.publish({
        destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/signal`,
        body: JSON.stringify({
          signal: "START",
          minigame: "ROCK_PAPER_SCISSORS"
        })
      })
      connections.stompConnection.publish({
        destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/signal`,
        body: JSON.stringify({
          signal: "START",
          minigame: "ROCK_PAPER_SCISSORS"
        })
      })
    }
    return () => {
      if (connections.stompConnection.state === ActivationState.ACTIVE) {
        connections.stompConnection.publish({
          destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/signal`,
          body: JSON.stringify({
            signal: "STOP",
            minigame: "ROCK_PAPER_SCISSORS"
          })
        })
        connections.stompConnection.publish({
          destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/signal`,
          body: JSON.stringify({
            signal: "STOP",
            minigame: "ROCK_PAPER_SCISSORS"
          })
        })
      }
    }
  }, [])

  useEffect(() => {
    if (connections.stompConnection.state === ActivationState.ACTIVE) {
      connections.stompConnection.subscribe(`/topic/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/input`, onPlayerOneInput);
      connections.stompConnection.subscribe(`/topic/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/input`, onPlayerTwoInput);
      return;
    }
    console.log("Subscribing to input");
    connections.stompConnection.onConnect = (_) => {
      connections.stompConnection.subscribe(`/topic/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/input`, onPlayerOneInput);
      connections.stompConnection.subscribe(`/topic/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/input`, onPlayerTwoInput);

      connections.stompConnection.publish({
        destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/signal`,
        body: JSON.stringify({
          signal: "START",
          minigame: "ROCK_PAPER_SCISSORS"
        })
      })
      connections.stompConnection.publish({
        destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/signal`,
        body: JSON.stringify({
          signal: "START",
          minigame: "ROCK_PAPER_SCISSORS"
        })
      })
    };
  }, [connections, lobbyContext, minigameContext])

  return (
    <div className="container">
      <h1>Rock Paper Scissors</h1>
      <div className="scoreboard">
        <div className="player-one-score">
          {score.playerOne}
        </div>
        <div className="player-two-score">
          {score.playerTwo}
        </div>
      </div>
      <div className="choices-container">
        <div className='play-container'>
          <PlayerContainer team="team1" player={minigameContext.minigame.team1Players[0]} />
          <p className={`choice ${playerOneChoice ? 'player-one-choice' : ''}`}>
            {playerOneChoice && (
              <>
                {playerOneChoice === 'rock' && (
                  <span role="img" aria-label="rock" style={{ fontSize: '10rem' }}>
                    ✊
                  </span>
                )}
                {playerOneChoice === 'paper' && (
                  <span role="img" aria-label="paper" style={{ fontSize: '10rem' }}>
                    🖐️
                  </span>
                )}
                {playerOneChoice === 'scissors' && (
                  <span role="img" aria-label="scissors" style={{ fontSize: '10rem' }}>
                    ✌️
                  </span>
                )}
                {playerOneChoice === 'hold' && (
                  <span role="img" aria-label="funny" style={{ fontSize: '10rem' }}>
                    💭
                  </span>

                )}
              </>
            )}
          </p>
        </div>
        <div className='play-container'>
          <PlayerContainer team="team2" player={minigameContext.minigame.team2Players[0]} />
          <p className={`choice ${playerTwoChoice ? 'player-two-choice' : ''}`}>
            {playerTwoChoice && (
              <>
                {playerTwoChoice === 'rock' && (
                  <span role="img" aria-label="rock" style={{ fontSize: '10rem' }}>
                    ✊
                  </span>
                )}
                {playerTwoChoice === 'paper' && (
                  <span role="img" aria-label="paper" style={{ fontSize: '10rem' }}>
                    🖐️
                  </span>
                )}
                {playerTwoChoice === 'scissors' && (
                  <span role="img" aria-label="scissors" style={{ fontSize: '10rem' }}>
                    ✌️
                  </span>
                )}
                {playerTwoChoice === 'hold' && (
                  <span role="img" aria-label="funny" style={{ fontSize: '10rem' }}>
                    💭
                  </span>

                )}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="winner">
        {winnerEachRound && (
          <>
            {winnerEachRound === 'tie' && (
              <span role="img" aria-label="tie" style={{ fontSize: '2rem' }}>
                🤝 tie
              </span>
            )}
            {winnerEachRound === 'playerOne' && (
              <span role="img" aria-label="player one" className='team1-color' style={{ fontSize: '2rem' }}>
                🎉 {minigameContext.minigame.team1Players[0].nickname} wins!
              </span>
            )}
            {winnerEachRound === 'playerTwo' && (
              <span role="img" aria-label="player two" className='team2-color' style={{ fontSize: '2rem' }}>
                🎉 {minigameContext.minigame.team2Players[0].nickname} wins!
              </span>
            )}
          </>
        )}
      </div>
      <div className="buttons">
        <button className="rock" onClick={() => setPlayerOneDecision('rock')}>
          ✊
        </button>
        <button className="paper" onClick={() => setPlayerOneDecision('paper')}>
          🖐️
        </button>
        <button className="scissors" onClick={() => setPlayerOneDecision('scissors')}>
          ✌️
        </button>
        <button className="rock" onClick={() => setPlayerTwoDecision('rock')}>
          ✊
        </button>
        <button className="paper" onClick={() => setPlayerTwoDecision('paper')}>
          🖐️
        </button>
        <button className="scissors" onClick={() => setPlayerTwoDecision('scissors')}>
          ✌️
        </button>

        </div>
        <div className='round-left'>
          Three points to win!
        </div>
          
    </div>
  );
};



import React, { useState, useEffect, useContext } from 'react';
import { ActivationState } from "@stomp/stompjs";
import { WebSocketContext } from "App";
import { LobbyContext, MinigameContext } from "components/routing/routers/AppRouter";


const HotPotato = () => {
    const [timeLeft, setTimeLeft] = useState(10);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [players, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5']);
    const [gameOver, setGameOver] = useState(false);
    const [index, setIndex] = useState(0);
    const [hasCooldown, setHasCooldown] = useState(true);
    const connections = useContext(WebSocketContext);
    const lobbyContext = useContext(LobbyContext);
    const minigameContext = useContext(MinigameContext);

    useEffect(() => {
        if (connections.stompConnection.state === ActivationState.ACTIVE) {
            if (connections.stompConnection.state === ActivationState.ACTIVE) {
                players.forEach(player => {
                    connections.stompConnection.publish({
                        destination: `/lobbies/${lobbyContext.lobby.id}/players/${player.id}/signal`,
                        body: JSON.stringify({
                            signal: "START",
                            minigame: "QUICK_FINGERS"
                        })
                    });
                });
            }

        }
        return () => {
            if (connections.stompConnection.state === ActivationState.ACTIVE) {
                players.forEach(player => {
                    connections.stompConnection.publish({
                        destination: `/lobbies/${lobbyContext.lobby.id}/players/${player.id}/signal`,
                        body: JSON.stringify({
                            signal: "STOP",
                            minigame: "HOTPOTATO"
                        })
                    });
                });
            }

        }
    }, [])
    useEffect(() => {

        if (connections.stompConnection.state === ActivationState.ACTIVE) {
            players.forEach(player => {
                connections.stompConnection.subscribe(`/topic/lobbies/${lobbyContext.lobby.id}/players/${player.id}/input`, handlePass);
            });
            return;
        }

        connections.stompConnection.onConnect = (_) => {
            players.forEach(player => {
                connections.stompConnection.subscribe(`/topic/lobbies/${lobbyContext.lobby.id}/players/${player.id}/input`, handlePass);
            });

            players.forEach(player => {
                connections.stompConnection.publish({
                    destination: `/lobbies/${lobbyContext.lobby.id}/players/${player.id}/signal`,
                    body: JSON.stringify({
                        signal: "START",
                        minigame: "HOTPOTATO"
                    })
                });
            });
        };
    }, [connections, lobbyContext, minigameContext]);








    useEffect(() => {
        if (timeLeft === 0) {
            handleExplode();
        }
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCooldown(false);
        }, 1000)
    }, [currentPlayer]);

    const endTurn = () => {
        if (hasCooldown === false) {
            setNextPlayer(currentPlayer);
            //TODO Sven: set mobile screen for player who has passed the bomb
        }
    };

    const setNextPlayer = (currentIndex) => {
        const newIndex = getNewIndex(currentIndex);
        setIndex(newIndex);
        setCurrentPlayer(newIndex);
        setHasCooldown(true);
        //TODO Sven: set mobile screen for player who received the bomb
    };

    const getNewIndex = (index) => {
        const newIndex = Math.floor(Math.random() * players.length);
        if (newIndex != index) {
            return newIndex
        }
        return getNewIndex(index)
    };

    const handlePass = () => {
        endTurn();
    };

    const handleExplode = () => {
        setGameOver(true);
    };

    return (
        <div>
            <h1>Hot Potato</h1>
            {!gameOver ? (
                <div>
                    <p>Time Left: {timeLeft}</p>
                    <p>Current Player: {players[currentPlayer]}</p>
                    <button onClick={handlePass}>Pass</button>
                    <button onClick={handleExplode}>Explode</button>
                </div>
            ) : (
                <><p>Game Over</p><label>{players[currentPlayer]} lost</label></>
            )}
        </div>
    );
};

export default HotPotato;

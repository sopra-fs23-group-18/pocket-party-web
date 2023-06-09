import React, { useContext } from "react";
import { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { Timer } from "components/ui/Timer";
import { WebSocketContext } from "App";
import { LobbyContext, MinigameContext } from "components/routing/routers/AppRouter";
import { ActivationState } from "@stomp/stompjs";
import { Button } from "components/ui/Button";
import { PongGameBoard } from "./pongGame/PongGameBoard";
import 'styles/games/PongGame.scss'
import PlayerContainer from "components/ui/PlayerContainer";


export const PongGame = props => {

    const movement = useRef();

    const connections = useContext(WebSocketContext);
    const lobbyContext = useContext(LobbyContext);
    const minigameContext = useContext(MinigameContext);

    const onPlayerOneInput = (msg) => {
        const data = JSON.parse(msg.body)
        console.log(data);
        if (data.inputType === "PONG") {
            if (data.rawData.x === 1) {
                movement.current.moveLeftPaddleUp();
            } else if (data.rawData.x === -1) {
                movement.current.moveLeftPaddleDown();
            } else if (data.rawData.x === 0) {
                movement.current.stopLeftPaddle();
            }
        }
    }

    const onPlayerTwoInput = (msg) => {
        const data = JSON.parse(msg.body)
        console.log(data);
        if (data.inputType === "PONG") {
            if (data.rawData.x === 1) {
                movement.current.moveRightPaddleUp();
            } else if (data.rawData.x === -1) {
                movement.current.moveRightPaddleDown();
            } else if (data.rawData.x === 0) {
                movement.current.stopRightPaddle();
            }
        }
    }

    useEffect(() => {
        if (connections.stompConnection.state === ActivationState.ACTIVE) {
            connections.stompConnection.publish({
                destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/signal`,
                body: JSON.stringify({
                    signal: "START",
                    minigame: "POCKET_PONG"
                })
            })
            connections.stompConnection.publish({
                destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/signal`,
                body: JSON.stringify({
                    signal: "START",
                    minigame: "POCKET_PONG"
                })
            })
        }
        return () => {
            if (connections.stompConnection.state === ActivationState.ACTIVE) {
                connections.stompConnection.publish({
                    destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team1Players[0].id}/signal`,
                    body: JSON.stringify({
                        signal: "STOP",
                        minigame: "POCKET_PONG"
                    })
                })
                connections.stompConnection.publish({
                    destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/signal`,
                    body: JSON.stringify({
                        signal: "STOP",
                        minigame: "POCKET_PONG"
                    })
                })
            }
        }
    }, [])

    useEffect(() => {
        const player = props.playerIndex === 0 ? minigameContext?.minigame.team1Players[0] : minigameContext?.minigame.team2Players[0];
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
                    minigame: "POCKET_PONG"
                })
            })
            connections.stompConnection.publish({
                destination: `/lobbies/${lobbyContext.lobby.id}/players/${minigameContext?.minigame.team2Players[0].id}/signal`,
                body: JSON.stringify({
                    signal: "START",
                    minigame: "POCKET_PONG"
                })
            })
        };
    }, [connections, lobbyContext, minigameContext])

    return (
        <div className="pong-game">
            <PongGameBoard ref={movement} />
            
            <div style={{ position: 'absolute', top: '20%', left: 0}}>
                <PlayerContainer team='team1' player={minigameContext?.minigame.team1Players[0]} />
            </div>
            <div style={{ position: 'absolute', top: '20%', right: 0}}>
                <PlayerContainer team='team2' player={minigameContext?.minigame.team2Players[0]} />
            </div>

            <div className="round-left">
                Five points to win!
            </div>
            
        </div>
    )
}


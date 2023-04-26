import BaseContainer from "components/ui/BaseContainer";
import GameHeader from "components/ui/HeaderContainer";
import PlayerContainer from "components/ui/PlayerContainer";
import "styles/views/GameWon.scss";
import Confetti from 'react-confetti';
import HeaderContainer from "components/ui/HeaderContainer";
import { useHistory, useLocation } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { api } from "helpers/api";
import { LobbyContext } from "components/routing/routers/AppRouter";

const MinigameWon = () => {

    const [hasWon, setHasWon] = useState("false");
    let location = useLocation();
    const navigation = useHistory();
    useEffect(() => {
        setTimeout(async () => {
            if (hasWon === "false") {
                navigation.push("/teamScoreOverview", location.state)
            }
            else if (hasWon === "true") {
                const winnerTeam = await api.get(`/lobbies/${LobbyContext}/winner`)
                navigation.push({
                    pathname: "/winner",
                    state: { winnerTeam: winnerTeam }
                });

            }

        }, 5000)
    }, [hasWon]);
    async function updateScores(winnerTeam) {
        const score = winnerTeam.score
        const color = winnerTeam.color
        const name = winnerTeam.name
        const requestbody = JSON.stringify(score, color, name)
        await api.put(`/lobbies/${LobbyContext}/minigame`, requestbody)
        const response = await api.get(`/lobbies/${LobbyContext}/gameover`)
        setHasWon(response.isFinished)
    }
    useEffect(() => {
        updateScores(location.state.winner);
    }, [])
    return (
        <BaseContainer>
            <HeaderContainer title="Winner" text="Minigame" ></HeaderContainer>
            <Confetti numberOfPieces={200} />
            <div className="gameWon maindiv">
                <label className="gameWon twi">The winner is</label>
                <div className="gameWon winner">
                    <PlayerContainer player={location.state.team1Player} />
                </div>
                <div className="gameWon loser">
                    <PlayerContainer player={location.state.team2Player} />
                </div>
            </div>
        </BaseContainer>
    )
}

export default MinigameWon;

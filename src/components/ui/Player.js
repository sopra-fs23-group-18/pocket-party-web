import "styles/ui/Player.scss";
import PropTypes from "prop-types";

function Player(props) {

  return (
    <div className='player-container'>
      <div className="player-name">{props.name}</div>
    </div>
  );
}

Player.propTypes = {
  name: PropTypes.string.isRequired
};

export default Player;

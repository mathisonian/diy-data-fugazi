import React from 'react';
let YouTube;

class YT extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    }
  }

  componentDidMount() {
    this.setState({ mounted: true });
    YouTube = require('react-youtube').default;
  }

  render() {
    if (!this.state.mounted) {
      return null;
    }

    const opts = {
      height: window.innerHeight,
      width: window.innerWidth,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: this.props.play,
        controls:0,
        disablekb:1,
        showinfo:0,
        autohide:1,
        rel:0,
        modestbranding:1,
        iv_load_policy: 3,
        start: 15
      }
    };

    return (
      <YouTube
        videoId={this.props.id}
        opts={opts}
        onReady={this._onReady.bind(this)}
      />
    );
  }

  componentDidUpdate(props, newState) {
    if (this._player && props.play !== this.props.play) {
      this.props.play ? this._player.playVideo() : this._player.pauseVideo();
    }
    if (this._player && props.audio !== this.props.audio) {
      this.props.audio ? this._player.unMute() : this._player.mute();
    }
  }

  _onReady(event) {
    this._player = event.target;
    if (!this.props.audio) {
      this._player.mute();
    }
    this.props.onReady && this.props.onReady();
  }
}

module.exports = YT;
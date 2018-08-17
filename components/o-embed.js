const React = require('react');
const EmbedContainer = require('react-oembed-container').default;

class OEmbed extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      markup: ''
    };
  }

  componentDidMount() {
    const provider = "https://app.flourish.studio/api/v1/oembed";
    const url = this.props.url;

    fetch(`${provider.replace('{format}', 'json')}?format=json&url=${encodeURIComponent(url)}`)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({
          markup: json.html
        });
      })
  }
  render() {
    const { idyll, hasError, updateProps, ...props } = this.props;
    console.log('setting markup', this.state.markup);
    if (this.state.markup) {
      console.log('setting');
      return (
        <div dangerouslySetInnerHTML={{ __html: this.state.markup }}  />
      );
    }
    return null;
  }
}

module.exports = OEmbed;
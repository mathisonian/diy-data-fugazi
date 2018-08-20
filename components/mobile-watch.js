const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 600;

class MobileWatch extends D3Component {

  initialize(node, props) {
    if ('ontouchstart' in document.documentElement && window.innerWidth < 1000) {
      props.updateProps({
        isMobile: true
      });
    }
  }

  update(props, oldProps) {
  }
}

module.exports = MobileWatch;

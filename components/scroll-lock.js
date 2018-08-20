const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 600;

class ScrollLock extends D3Component {

  initialize(node, props) {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    }

    if (props.locked) {
      d3.select('body').style('overflow', 'hidden').style('width', '100vw').style('height', '100vh');
      window.scrollTo(0, 0);
    }
  }

  update(props, oldProps) {
    if (props.locked !== oldProps.locked) {
      if (props.locked) {
        d3.select('body').style('overflow', 'hidden').style('width', '100vw').style('height', '100vh');
      } else {
        window.scrollTo(0, 0);
        d3.select('body').style('overflow', 'auto').style('width', '100vw').style('height', 'auto');
      }
    }
  }
}

module.exports = ScrollLock;

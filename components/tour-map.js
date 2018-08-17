/// app.js
import React, {Component} from 'react';
import MapGL, {FlyToInterpolator} from 'react-map-gl';
import DeckGL, {LineLayer, ArcLayer, ScatterplotLayer} from 'deck.gl';

const Victory = require('victory');
const Color = require('color');

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWF0aGlzb25pYW4iLCJhIjoiY2l5bTA5aWlnMDAwMDN1cGZ6Y3d4dGl6MSJ9.JZaRAfZOZfAnU2EAuybfsg';


const d3 = require('d3');
const Chromatic = require('d3-scale-chromatic');

// const colors = {};

const color = d3.scaleSequential(Chromatic.interpolateYlGnBu).domain([1987, 2002]);

const VIEWPORTS = {
  'australia': {
    latitude: -25.2744,
    longitude: 133.7751,
    pitch: 10,
    zoom: 3,
    bearing: 0
  },
  'south-america': {
    latitude: -23.5505,
    longitude: -46.6333,
    pitch: 10,
    zoom: 3,
    bearing: 0
  },
  'north-america': {
    latitude: 37.0902,
    longitude: -95.7129,
    pitch: 30,
    zoom: 3,
    bearing: 0
  },
  'east-coast': {
    latitude: 38.9072,
    longitude: -77.0369,
    pitch: 60,
    zoom: 5,
    bearing: -50
  },
  'europe': {
    latitude: 54.5260,
    longitude: 15.2551,
    zoom: 3,
    pitch: 60,
    bearing: 45
  },

}


let initialViewport;

class App extends Component {

  constructor(props) {
    super(props);

    initialViewport = Object.assign({
      latitude: 0,
      longitude: 0,
      zoom: 1,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
      transitionDuration: 5000,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: d3.easeCubic,
      onTransitionStart: () => {
        this.setState({ transitioning: true })
      },
      onTransitionEnd: () => {
        this.setState({ transitioning: false })
      }
    });


    const data = this.props.data;
    const tours = {};
    data.forEach((d) => {
      if (!tours[d.tour]) {
        tours[d.tour] = [];
        // colors[d.tour] = [255 * Math.random(), 255 * Math.random(), 255 * Math.random()];
      }
      tours[d.tour].push(d);
    });
    Object.keys(tours).forEach((tourName) => {
      const tourDates = tours[tourName];
      tourDates.sort((a, b) => new Date(a.date) < new Date(b.date));
      tours[tourName] = tourDates;
    })


    console.log('setting tour names: ', Object.keys(tours))
    this.props.updateProps({ tourNames: Object.keys(tours) });

    this.state = {
      tours: tours,
      viewport: initialViewport,
      initialized: false,
      transitioning: false
    };

  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: Object.assign({}, this.state.viewport, viewport)
    });
  }
  componentDidMount() {
    this._resize();
    setTimeout(() => {
      this.setState({ initialized: true });
    }, 150)
    window.addEventListener('resize', this._resize.bind(this));
  }

  componentWillReceiveProps(newProps) {
    if (newProps.focus !== this.props.focus) {
      if (newProps.focus) {
        this.setState({
          viewport: Object.assign({}, this.state.viewport, VIEWPORTS[newProps.focus] || {})
        })
      } else {
        this.setState({
          viewport: Object.assign({}, this.state.viewport, initialViewport)
        })
      }
    } else if (newProps.stepFocus !== this.props.stepFocus) {
      if (newProps.stepFocus) {
        this.setState({
          viewport: Object.assign({}, this.state.viewport, VIEWPORTS[newProps.stepFocus] || {})
        })
      } else {
        this.setState({
          viewport: Object.assign({}, this.state.viewport, initialViewport)
        })
      }
    }
  }

  getLayers() {

    const availableShows = Object.keys(this.state.tours)
    .filter((tourName) => {
      if (this.props.selectedTour) {
        return this.props.selectedTour === tourName;
      }
      if (this.props.selectedDecade) {
        return tourName.indexOf(this.props.selectedDecade) > -1;
      }
      return true;
    });


    const pointData = [];

    // if (this.props.focus === null) {
      availableShows
      .map((tourName) => {
        const tourDates = this.state.tours[tourName];
        tourDates.forEach((d, i) => {
          const lastDate = tourDates[i - 1];

          pointData.push({
            coordinates: [d.x, d.y],
            color: [239, 239, 239],// Color(color(+d.year)).rgb().array(),// colors[tourName],
            opacity: 1,
            venue: d.venue,
            // radius: 30
          });
          // pointData.push({
          //   coordinates: [d.x, d.y, 1],
          //   color: [0, 0, 0],// Color(color(+d.year)).rgb().array(),// colors[tourName],
          //   opacity: 1,
          //   venue: d.venue,
          //   radius: 20
          // });

        })
      })
    // }

    const points = (new ScatterplotLayer({
        id: 'points',
        strokeWidth: 3,
        opacity: 1,
        data: pointData,
        pickable: true,
        // radiusScale: 10000,
        getPosition: d => d.coordinates,
        // getRadius: d => d.radius,
        radiusMinPixels: 2,
        onHover: ({object}) => alert(`${object.venue}`)
      }));




    let arcData = [];
    availableShows
      .map((tourName) => {
      const tourDates = this.state.tours[tourName];
      tourDates.forEach((d, i) => {
        if (i === 0) {
          return null;
        }
        const lastDate = tourDates[i - 1];
        const color = ('' + d.year).indexOf('198') > -1 ? [125, 152, 161] : ('' + d.year).indexOf('200') > -1 ? [138, 234, 146] : [213, 69, 60]
        arcData.push({
          sourcePosition: [lastDate.x, lastDate.y],
          targetPosition: [d.x, d.y],
          color: color,// Color(color(+d.year)).rgb().array(),// colors[tourName],
          opacity: 1
        });
      })
    })
    const arcs = new ArcLayer({id: 'arcs', strokeWidth: 3, opacity: 0.5, data: arcData });

    // return arcs;
    return [points, arcs];
    // return points;
  }

  _initialize(gl) {
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    // gl.blendEquation(gl.FUNC_ADD);
    // this.props.updateProps({ stepperIndex: this.props.stepperIndex + 1  });
    this.props.updateProps({ isLoaded: true  });
  }

  render() {
    const { viewport, initialized, transitioning } = this.state;
    if (!initialized) {
      return <div className="idyll-loading">Loading dataset...</div>;
    }

    // const { longitude, latitude, zoom, pitch } = viewport;

    // const layers = ;
    const _onChangeViewport = this._onChangeViewport.bind(this);

    return (
    //   <Victory.VictoryAnimation duration={2000} data={{ longitude, latitude, zoom, pitch }}>
    //     {
    //       (tweenedViewport) => {
    //         return (
              <MapGL
                {...viewport}
                // {...tweenedViewport}
                mapStyle="mapbox://styles/mapbox/dark-v9"
                dragRotate={true}
                onViewportChange={_onChangeViewport}
                mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
                <DeckGL {...viewport} /*{...tweenedViewport}*/
                  layers={this.getLayers()}
                  onWebGLInitialized={this._initialize.bind(this)}
                  />
              </MapGL>
            )
    //       }
    //     }
    //   </Victory.VictoryAnimation>
    // )
  }
}

module.exports = App;
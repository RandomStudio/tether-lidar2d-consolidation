import 'rxjs';
import React from 'react';
import ReactDOM from 'react-dom';

import WebSocketManager, { SocketState, WebSocketMessageType } from './WebSocketManager';

import './index.scss';
import DialogWindow from './components/DialogWindow/DialogWindow';
import BusyIndicator from './components/BusyIndicator/BusyIndicator';
import Lidar from './components/Lidar';
import Consolidation from './components/Consolidation';
import Controls from './components/Controls';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lidars: [],
      consolidatedPoints: [],
      pointSize: 2,
      scale: 0.2,
      fadeSpeed: 0.06,
      socketState: null,
      busy: false,
      error: null,
    };
    this.loadConfig();
  }

  loadConfig = async () => {
    await this.fetchURL(
      `/api/config`,
      { method: 'GET' },
      true,
      'Could not load config.'
    ).then(json => {
      const { host, wsPort } = json;
      this.webSocket = new WebSocketManager(host, wsPort);
      this.webSocket.on(WebSocketMessageType.SOCKET_STATE_CHANGE, this.onWebSocketStateChange);
      this.webSocket.on(WebSocketMessageType.LIDAR_UPDATE, this.onLidarUpdate);
      this.webSocket.on(WebSocketMessageType.CONSOLIDATION_UPDATE, this.onConsolidationUpdate);
      document.addEventListener('visibilitychange', this.onDocumentVisibilityChange);
      this.onDocumentVisibilityChange();
    });

    this.loadLidars();
  }

  loadLidars = async () => {
    await this.fetchURL(
      `/api/lidars/all`,
      { method: 'GET' },
      true,
      'Could not load lidar data.'
    ).then(json => {
      this.setState({
        lidars: json
      });
    });
  }

  onWebSocketStateChange = (socketState) => {
    this.setState({
      socketState
    });
  }

  onLidarUpdate = (serial, samples) => {
    const { lidars } = this.state;
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        samples: l.serial === serial
          ? samples.filter(s => s.quality > 0)
          : l.samples
      }))
    });
  }

  onConsolidationUpdate = (points) => {
    this.setState({
      consolidatedPoints: points
    });
  }

  onDocumentVisibilityChange = () => {
    const { visibilityState } = document;
    switch (visibilityState) {
      case 'hidden':
        if (this.webSocket) {
          this.webSocket.disconnect();
        }
        break;
      case 'visible':
        if (this.webSocket) {
          this.webSocket.connect();
        }
        break;
      default:
        // do nothing
    }
  }

  onSetRotation = (serial, value) => {
    // update state
    const { lidars } = this.state;
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        rotation: l.serial === serial
          ? value
          : l.rotation
      }))
    });
  }

  onSetTranslation = (serial, x, y) => {
    // update state
    const { lidars } = this.state;
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        x: l.serial === serial
          ? Math.round(x)
          : l.x,
        y: l.serial === serial
          ? Math.round(y)
          : l.y,
      }))
    });
  }

  onSetColor = (serial, r, g, b) => {
    // update state
    const { lidars } = this.state;
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        color: l.serial === serial
          ? [Math.round(r), Math.round(g), Math.round(b)]
          : l.color,
      }))
    });
  }

  onSetPointSize = (value) => {
    this.setState({ pointSize: value });
  }
  
  onSetScale = (value) => {
    this.setState({ scale: value });
  }
  
  onSetFadeSpeed = (value) => {
    this.setState({ fadeSpeed: value });
  }

  onSave = (serial) => {
    const { lidars } = this.state;
    const lidar = lidars.find(l => l.serial === serial);
    if (lidar) {
      const { rotation, x, y, color } = lidar;
      this.fetchURL(
        '/api/lidar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serial,
            rotation,
            x,
            y,
            color
          })
        },
        false,
        'Could not save lidar configuration.'
      );
    }
  }

  /**
   * Generic method to initiate an http request, including state
   * updates for the UI (i.e. busy indicator and error messages)
   * @param {string} url 
   * @param {*} options 
   * @param {boolean} expectJSONResponse
   * @param {string} errorMessage 
   */
  fetchURL = (url, options, expectJSONResponse, errorMessage) => {
    this.setState({
      busy: true,
    });
    return fetch(url, options)
      .then(response => {
        if (response.ok) {
          return expectJSONResponse ? response.json() : true;
        } 
        throw new Error(response.status);
      })
      .then(result => {
        this.setState({
          busy: false,
        });
        return result;
      })
      .catch(err => {
        this.setState({
          busy: false,
          error: `${errorMessage} Error:\n${err}`
        });
        console.error(`${errorMessage} Error: ${err}`);
      });
  }

  onCloseErrorDialog = () => {
    this.setState({
      error: null
    });
  }

  render() {
    const {
      lidars,
      consolidatedPoints,
      pointSize,
      scale,
      fadeSpeed,
      socketState,
      busy,
      error
    } = this.state;
    return (
      <>
        {lidars.map(({ samples, rotation, x, y, color }, index) => (
          <Lidar
            key={index}
            samples={samples}
            rotation={rotation}
            x={x}
            y={y}
            color={color}
            pointSize={pointSize}
            scale={scale}
            fadeSpeed={fadeSpeed}
          />
        ))}
        <Consolidation
          points={consolidatedPoints}
          scale={scale}
        />
        <Controls
          lidars={lidars}
          pointSize={pointSize}
          scale={scale}
          fadeSpeed={fadeSpeed}
          onSetRotation={this.onSetRotation}
          onSetTranslation={this.onSetTranslation}
          onSetColor={this.onSetColor}
          onSetPointSize={this.onSetPointSize}
          onSetScale={this.onSetScale}
          onSetFadeSpeed={this.onSetFadeSpeed}
          onSave={this.onSave}
        />
        {socketState !== SocketState.OPEN
          && (
          <DialogWindow
            title="No connection"
            body={`Not connected to server\nSocket state: ${socketState}`}
            options={[]}
          />
          )}
        {error
          && (
          <DialogWindow
            title="Error"
            body={error}
            onClose={this.onCloseErrorDialog}
          />
          )}
        {busy
          && <BusyIndicator />}
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

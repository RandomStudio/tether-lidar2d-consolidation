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
      scale: 1,
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
          ? samples
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
    console.log(`Setting lidar rotation. Serial: ${serial}, rotation: ${rotation}deg`);
    // update state
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        rotation: l.serial === serial
          ? value
          : l.rotation
      }))
    });
    // send to server
    // this.fetchURL(
    //   `/api/lidar/rotation`,
    //   {
    //     method: 'PUT',
    //     body: {
    //       serial,
    //       rotation
    //     }
    //   },
    //   `Could not save rotation.`
    // );
  }

  onSetTranslation = (serial, x, y) => {
    console.log(`Setting lidar translation. Serial: ${serial}, x: ${x}, y: ${y}`);
    // update state
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        x: l.serial === serial
          ? x
          : l.x,
        y: l.serial === serial
          ? y
          : l.y,
      }))
    });
    // send to server
    // this.fetchURL(
    //   `/api/lidar/translation`,
    //   {
    //     method: 'PUT',
    //     body: {
    //       serial,
    //       x,
    //       y
    //     }
    //   },
    //   `Could not save translation.`
    // );
  }

  onSetColor = (serial, r, g, b) => {
    console.log(`Setting lidar color. Serial: ${serial}, color:`, r, g, b);
    // update state
    this.setState({
      lidars: lidars.map(l => ({
        ...l,
        color: l.serial === serial
          ? [r, g, b]
          : l.color,
      }))
    });
    // send to server
    // this.fetchURL(
    //   `/api/lidar/color`,
    //   {
    //     method: 'PUT',
    //     body: {
    //       serial,
    //       color
    //     }
    //   },
    //   `Could not save translation.`
    // );
  }

  onSetPointSize = (value) => {
    console.log(`Setting point size to ${value}`);
    this.setState({ pointSize: value });
  }
  
  onSetScale = (value) => {
    console.log(`Setting scale to ${value}`);
    this.setState({ scale: value });
  }

  /**
   * Generic method to initiate an http request, including state
   * updates for the UI (i.e. busy indicator and error messages)
   * @param {string} url 
   * @param {*} options 
   * @param {string} errorMessage 
   */
  fetchURL = (url, options, errorMessage) => {
    this.setState({
      busy: true,
    });
    return fetch(url, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        } 
        throw new Error(response.status);
      })
      .then(json => {
        this.setState({
          busy: false,
        });
        return json;
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
      socketState,
      busy,
      error
    } = this.state;
    return (
      <>
        {lidars.map(({ serial, samples, rotation, translationX, translationY, color }, index) => (
          <Lidar
            key={index}
            samples={samples}
            rotation={rotation}
            translationX={translationX}
            translationY={translationY}
            color={color}
            pointSize={pointSize}
            scale={scale}
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
          onSetRotation={this.onSetRotation}
          onSetTranslation={this.onSetTranslation}
          onSetColor={this.onSetColor}
          onSetPointSize={this.onSetPointSize}
          onSetScale={this.onSetScale}
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

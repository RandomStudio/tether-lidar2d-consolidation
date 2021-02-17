import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Row from './row';
import RowName from './rowName';
import './index.scss';

const Controls = ({
  lidars,
  pointSize,
  scale,
  fadeSpeed,
  consolidationAlpha,
  onSetName,
  onSetRotation,
  onSetTranslation,
  onSetColor,
  onSetPointSize,
  onSetScale,
  onSetFadeSpeed,
  onSetConsolidationAlpha,
  onSave,
}) => {
  const [selectedSerial, onSelectLidar] = useState(null);
  const lidar = lidars.find(l => l.serial === selectedSerial);
  return (
    <div className="controls">
      <Row
        label="Point size"
        min={1}
        max={10}
        value={pointSize}
        precision={1}
        units="px"
        onChange={onSetPointSize}
      />
      <Row
        label="Scale"
        min={0.01}
        max={2}
        value={scale}
        precision={2}
        onChange={onSetScale}
      />
      <Row
        label="Fade speed"
        min={0}
        max={1}
        value={fadeSpeed}
        precision={3}
        onChange={onSetFadeSpeed}
      />
      <Row
        label="Result alpha"
        min={0}
        max={1}
        value={consolidationAlpha}
        precision={3}
        onChange={onSetConsolidationAlpha}
      />

      <hr className="separator" />
      
      <select onChange={event => {
        onSelectLidar(event.target.value);
      }}
      >
        <option value="-">Select a lidar sensor</option>
        {lidars.map((l, i) => (
          <option key={i} value={l.serial}>
            {l.name && l.name.length ? l.name : l.serial}
          </option>
        ))}
      </select>
      {lidar && (
        <>
          <RowName
            label="Serial"
            value={lidar.serial}
            disabled
          />
          <RowName
            label="Name"
            value={lidar.name}
            onChange={value => {
              onSetName(selectedSerial, value);
            }}
          />
          <Row
            label="Rotation"
            min={0}
            max={360}
            value={lidar.rotation}
            precision={1}
            units="º"
            onChange={value => {
              onSetRotation(selectedSerial, value);
            }}
          />
          <Row
            label="X"
            min={-10000}
            max={10000}
            value={lidar.x}
            precision={0}
            units="mm"
            onChange={value => {
              onSetTranslation(selectedSerial, value, lidar.y);
            }}
          />
          <Row
            label="Y"
            min={-10000}
            max={10000}
            value={lidar.y}
            precision={0}
            units="mm"
            onChange={value => {
              onSetTranslation(selectedSerial, lidar.x, value);
            }}
          />
          <Row
            label="Color R"
            min={0}
            max={255}
            precision={0}
            value={lidar.color[0]}
            onChange={value => {
              onSetColor(selectedSerial, value, lidar.color[1], lidar.color[2]);
            }}
          />
          <Row
            label="G"
            min={0}
            max={255}
            precision={0}
            value={lidar.color[1]}
            onChange={value => {
              onSetColor(selectedSerial, lidar.color[0], value, lidar.color[2]);
            }}
          />
          <Row
            label="B"
            min={0}
            max={255}
            precision={0}
            value={lidar.color[2]}
            onChange={value => {
              onSetColor(selectedSerial, lidar.color[0], lidar.color[1], value);
            }}
          />
          <div className="buttons">
            <button className="save" type="submit" onClick={() => onSave(selectedSerial)}>Save</button>
          </div>
        </>
      )}
    </div>
  );
};

Controls.propTypes = {
  lidars: PropTypes.arrayOf(PropTypes.shape({
    serial: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    rotation: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.arrayOf(PropTypes.number).isRequired,
  })),
  pointSize: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  fadeSpeed: PropTypes.number.isRequired,
  consolidationAlpha: PropTypes.number.isRequired,
  onSetName: PropTypes.func.isRequired,
  onSetRotation: PropTypes.func.isRequired,
  onSetTranslation: PropTypes.func.isRequired,
  onSetColor: PropTypes.func.isRequired,
  onSetPointSize: PropTypes.func.isRequired,
  onSetScale: PropTypes.func.isRequired,
  onSetFadeSpeed: PropTypes.func.isRequired,
  onSetConsolidationAlpha: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  lidars: [],
};

export default Controls;

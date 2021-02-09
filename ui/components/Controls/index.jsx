import React, { useState } from 'react';
import PropTypes from 'prop-types';
import HSlider from '../HSlider';
import './index.scss';

const Controls = ({
  lidars,
  pointSize,
  scale,
  onSetRotation,
  onSetTranslation,
  onSetColor,
  onSetPointSize,
  onSetScale
}) => {
  const [selectedSerial, onSelectLidar] = useState(null);
  const lidar = lidars.find(l => l.serial === selectedSerial);
  return (
    <div className="controls">
      <select onChange={event => {
        console.log(event.target.value);
        onSelectLidar(event.target.value);
      }}
      >
        <option value="-">Select a lidar sensor</option>
        {lidars.map((l, i) => (
          <option key={i} value={l.serial}>{l.serial}</option>
        ))}
      </select>
      {lidar && (
        <>
          <div className="row">
            <span>Rotation</span>
            <HSlider
              width={10}
              widthUnit="em"
              className="slider"
              min={0}
              max={360}
              value={lidar.rotation}
              onChange={value => {
                onSetRotation(selectedSerial, value);
              }}
            />
            <span>
              {lidar.rotation}
              º
            </span>
          </div>
          <div className="row">
            <span>Translation X</span>
            <HSlider
              width={10}
              widthUnit="em"
              className="slider"
              min={-10000}
              max={10000}
              value={lidar.x}
              onChange={value => {
                onSetTranslation(selectedSerial, value, lidar.y);
              }}
            />
            <span>
              {lidar.x}
              mm
            </span>
          </div>
          <div className="row">
            <span>Translation Y</span>
            <HSlider
              width={10}
              widthUnit="em"
              className="slider"
              min={-10000}
              max={10000}
              value={lidar.y}
              onChange={value => {
                onSetTranslation(selectedSerial, lidar.x, value);
              }}
            />
            <span>
              {lidar.y}
              mm
            </span>
          </div>
          <div className="row">
            <span>Color</span>
            <div className="col">
              <div className="row">
                <span>R</span>
                <HSlider
                  width={10}
                  widthUnit="em"
                  className="slider"
                  min={0}
                  max={255}
                  value={lidar.color[0]}
                  onChange={value => {
                    onSetColor(selectedSerial, value, lidar.color[1], lidar.color[2]);
                  }}
                />
                <span>{lidar.color[0]}</span>
              </div>
              <div className="row">
                <span>G</span>
                <HSlider
                  width={10}
                  widthUnit="em"
                  className="slider"
                  min={0}
                  max={255}
                  value={lidar.color[1]}
                  onChange={value => {
                    onSetColor(selectedSerial, lidar.color[0], value, lidar.color[2]);
                  }}
                />
                <span>{lidar.color[1]}</span>
              </div>
              <div className="row">
                <span>B</span>
                <HSlider
                  width={10}
                  widthUnit="em"
                  className="slider"
                  min={0}
                  max={255}
                  value={lidar.color[2]}
                  onChange={value => {
                    onSetColor(selectedSerial, lidar.color[0], lidar.color[1], value);
                  }}
                />
                <span>{lidar.color[2]}</span>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="row">
        <span>Point size</span>
        <HSlider
          width={10}
          widthUnit="em"
          className="slider"
          min={1}
          max={10}
          value={pointSize}
          onChange={onSetPointSize}
        />
        <span>{pointSize}</span>
      </div>
      <div className="row">
        <span>Scale</span>
        <HSlider
          width={10}
          widthUnit="em"
          className="slider"
          min={0.01}
          max={2}
          value={scale}
          onChange={onSetScale}
        />
        <span>{scale}</span>
      </div>
    </div>
  );
};

Controls.propTypes = {
  lidars: PropTypes.arrayOf(PropTypes.shape({
    serial: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.arrayOf(PropTypes.number).isRequired,
  })),
  pointSize: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  onSetRotation: PropTypes.func.isRequired,
  onSetTranslation: PropTypes.func.isRequired,
  onSetColor: PropTypes.func.isRequired,
  onSetPointSize: PropTypes.func.isRequired,
  onSetScale: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  lidars: [],
};

export default Controls;

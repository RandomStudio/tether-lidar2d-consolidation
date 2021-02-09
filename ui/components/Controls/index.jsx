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
      <select placeholder="Choose a lidar" onChange={onSelectLidar}>
        {lidars.map((l, i) => (
          <option key={i} value={lidars.serial}>{lidars.serial}</option>
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
          </div>
          <div className="row">
            <span>Translation X</span>
            <HSlider
              width={10}
              widthUnit="em"
              className="slider"
              min={-10000}
              max={10000}
              value={lidar.translationX}
              onChange={value => {
                onSetTranslation(selectedSerial, value, lidar.translationY);
              }}
            />
          </div>
          <div className="row">
            <span>Translation Y</span>
            <HSlider
              width={10}
              widthUnit="em"
              className="slider"
              min={-10000}
              max={10000}
              value={lidar.translationY}
              onChange={value => {
                onSetTranslation(selectedSerial, lidar.translationX, value);
              }}
            />
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
      </div>
      <div className="row">
        <span>Scale</span>
        <HSlider
          width={10}
          widthUnit="em"
          className="slider"
          min={0.001}
          max={1}
          value={scale}
          onChange={onSetScale}
        />
      </div>
    </div>
  );
};

Controls.propTypes = {
  lidars: PropTypes.arrayOf(PropTypes.shape({
    serial: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired,
    translationX: PropTypes.number.isRequired,
    translationY: PropTypes.number.isRequired,
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

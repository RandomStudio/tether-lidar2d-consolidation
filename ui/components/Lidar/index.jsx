import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const Lidar = ({
  samples,
  rotation,
  x,
  y,
  color,
  pointSize,
  scale,
}) => {
  const width = 512;
  const height = 512;
  const canvasEl = useRef(null);

  useEffect(() => {
    if (canvasEl.current) {
      const canvas = canvasEl.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      // draw origin
      ctx.strokeStyle = getColorString(color);
      ctx.beginPath();
      ctx.globalAlpha = 0.35;
      ctx.moveTo((0.5 * width) - (100 * scale), 0.5 * height);
      ctx.lineTo((0.5 * width) + (100 * scale), 0.5 * height);
      ctx.moveTo(0.5 * width, (0.5 * height) - (100 * scale));
      ctx.lineTo(0.5 * width, (0.5 * height) + (100 * scale));
      ctx.stroke();
      // draw sample points
      ctx.globalAlpha = 1;
      ctx.fillStyle = getColorString(color);
      samples.filter(s => s.quality > 0).forEach(sample => {
        const { angle, distance } = sample;
        const rad = Math.PI * (angle / 180);
        const px = (0.5 * width) + (Math.cos(rad) * distance * scale) - (0.5 * pointSize);
        const py = (0.5 * height) + (Math.sin(rad) * distance * scale) - (0.5 * pointSize);
        ctx.fillRect(px, py, pointSize, pointSize);
      });
    }
  });

  const getColorString = rgb => {
    let clr = 0;
    for (let i = 0; i < rgb.length; i += 1) {
      clr |= rgb[i] << ((rgb.length - 1 - i) * 8);
    }
    return `#${clr.toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="lidar">
      <canvas
        ref={canvasEl}
        width={width}
        height={height}
        style={{
          transform: `rotate(${rotation}deg) translate(${x * scale}px, ${y * scale}px)`
        }}
      />
    </div>
  );
};

Lidar.propTypes = {
  samples: PropTypes.arrayOf(PropTypes.shape({
    angle: PropTypes.number,
    distance: PropTypes.number,
    quality: PropTypes.number,
  })),
  rotation: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  color: PropTypes.arrayOf(PropTypes.number),
  pointSize: PropTypes.number,
  scale: PropTypes.number,
};

Lidar.defaultProps = {
  samples: [],
  rotation: 0,
  x: 0,
  y: 0,
  color: [255, 0, 0],
  pointSize: 2,
  scale: 1
};

export default Lidar;

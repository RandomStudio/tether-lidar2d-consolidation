import React, { useEffect } from 'react';
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
  const width = 256;
  const height = 256;
  const canvasEl = useRef(null);

  useEffect(() => {
    if (canvasEl.current) {
      const canvas = HTMLCanvasElement(canvasEl.current);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = getColorString(color);
      samples.filter(s => s.quality > 0).forEach(sample => {
        const { angle, distance } = sample;
        const px = (0.5 * width) + (Math.cos(angle) * distance * scale) - (0.5 * pointSize);
        const py = (0.5 * height) + (Math.sin(angle) * distance * scale) - (0.5 * pointSize);
        ctx.fillRect(px, py, pointSize);
      });
    }
  });

  const getColorString = rgb => {
    let clr = 0;
    for (let i = 0; i < rgb.length; i += 1) {
      clr |= rgb[i] << ((rgb.length - i) * 8);
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

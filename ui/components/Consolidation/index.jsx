import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const TWO_PI = 2 * Math.PI;

const Consolidation = ({ points, scale }) => {
  const width = 512;
  const height = 512;
  const canvasEl = useRef(null);

  useEffect(() => {
    if (canvasEl.current) {
      const canvas = canvasEl.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      points.forEach(({ size, position: { x, y } }) => {
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, 0.5 * size * scale, 0, TWO_PI);
      });
      ctx.stroke();
    }
  });

  return (
    <div className="consolidation">
      <canvas ref={canvasEl} width={width} height={height} />
    </div>
  );
};

Consolidation.propTypes = {
  points: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    size: PropTypes.number,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  })),
  scale: PropTypes.number,
};

Consolidation.defaultProps = {
  points: [],
  scale: 1,
};

export default Consolidation;

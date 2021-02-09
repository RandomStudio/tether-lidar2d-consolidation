import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import HSlider from '../HSlider';

const Row = ({ label, min, max, value, precision, units, onChange }) => {
  const inputEl = useRef(null);

  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.value = value;
    }
  });

  const onFocus = event => {
    event.target.select();
  };
  
  const onInput = event => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      onBlur(event);
      event.target.select();
    }
  };

  const onBlur = event => {
    const val = parseFloat(event.target.value, 10);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className="row">
      <span className="label">{label}</span>
      <HSlider
        width={10}
        widthUnit="em"
        className="slider"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
      />
      <div className="value">
        <input
          type="number"
          min={min}
          max={max}
          precision={precision}
          ref={inputEl}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onInput}
        />
        <span>{units}</span>
      </div>
    </div>
  );
};

Row.propTypes = {
  label: PropTypes.string.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number,
  precision: PropTypes.number,
  units: PropTypes.string,
  onChange: PropTypes.func,
};

Row.defaultProps = {
  min: 0,
  max: 1,
  value: 0,
  precision: 0,
  units: '',
  onChange: null,
};

export default Row;

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const RowName = ({ label, value, disabled, onChange }) => {
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
    if (disabled) {
      event.stopImmediatePropagation();
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      onBlur(event);
      event.target.select();
    }
  };

  const onBlur = event => {
    onChange(event.target.value);
  };

  return (
    <div className="row">
      <span className="label">{label}</span>
      <input
        ref={inputEl}
        title={value}
        disabled={disabled}
        onFocus={disabled ? null : onFocus}
        onBlur={disabled ? null : onBlur}
        onKeyDown={disabled ? null : onInput}
      />
      <div className="value" />
    </div>
  );
};

RowName.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

RowName.defaultProps = {
  disabled: false,
  onChange: null,
};

export default RowName;

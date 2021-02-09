import React from 'react';
import PropTypes from 'prop-types';

import './DialogWindow.scss';

const DialogWindow = props => {
  const { title, body, options, onClose } = props;
  return (
    <div className="modal" onClick={onClose}>
      <div className="dialog">
        <h2 className="title">{title}</h2>
        <p className="body">{body}</p>
        <div className="buttons">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              value={option.value}
              onClick={() => (option.onClick ? option.onClick(option.value) : onClose())}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

DialogWindow.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
      onClick: PropTypes.func
    })
  ),
  onClose: PropTypes.func.isRequired
};

DialogWindow.defaultProps = {
  options: [{
    label: 'OK'
  }]
};

export default DialogWindow;

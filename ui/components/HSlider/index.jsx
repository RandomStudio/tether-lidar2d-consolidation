import React from 'react';
import PropTypes from 'prop-types';

import './index.scss';

class HSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDragging: false,
    };
    this.trackRef = React.createRef();
  }

  grab = event => {
    const { isDragging } = this.state;
    if (this.trackRef.current && !isDragging) {
      this.setState({
        isDragging: true
      });
      this.drag(event);
      window.addEventListener('mousemove', this.drag);
      window.addEventListener('touchmove', this.drag);
      window.addEventListener('mouseup', this.release);
      window.addEventListener('touchend', this.release);
      window.addEventListener('mouseleave', this.release);
      window.addEventListener('touchleave', this.release);
    }
  }

  drag = event => {
    const { min, max, onChange } = this.props;
    if (onChange && this.trackRef.current) {
      const { pageX } = event.type.substr(0, 5) === 'touch' ? event.touches[0] : event;
      const { left, width } = this.trackRef.current.getBoundingClientRect();
      const factor = Math.max(0, Math.min(1, (pageX - left) / width));
      onChange(min + factor * (max - min));
    }
  }

  release = event => {
    window.removeEventListener('mousemove', this.drag);
    window.removeEventListener('touchmove', this.drag);
    window.removeEventListener('mouseup', this.release);
    window.removeEventListener('touchend', this.release);
    window.removeEventListener('mouseleave', this.release);
    window.removeEventListener('touchleave', this.release);
    this.setState({
      isDragging: false
    });
  }

  render() {
    const {
      width,
      widthUnit,
      className,
      min,
      max,
      value
    } = this.props;
    const normalizedValue = (value - min) / (max - min);
    return (
      <div
        className={`hslider ${className}`}
        onMouseDown={this.grab}
        onTouchStart={this.grab}
      >
        <div
          className="track"
          ref={this.trackRef}
          style={{ width: `${width}${widthUnit}` }}
        />
        <div
          className="handle"
          style={{
            marginLeft: `${
              width * Math.max(0, Math.min(1, normalizedValue))
            }${widthUnit}`
          }}
        />
      </div>
    );
  }
}

HSlider.propTypes = {
  width: PropTypes.number,
  widthUnit: PropTypes.string,
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func
};

HSlider.defaultProps = {
  width: 100,
  widthUnit: 'px',
  className: '',
  min: 0,
  max: 1,
  onChange: null
};

export default HSlider;

import React, { Component } from 'react';
import { View, Animated, Text, Dimensions, PanResponder } from 'react-native';
import styles from '../styles/styles';

export default class ColorPicker extends Component {
  constructor() {
    super();

    this.state = {
      pan: {
        one: new Animated.ValueXY(),
        two: new Animated.ValueXY(),
        three: new Animated.ValueXY()
      },
      bgColor: [],
      areaHeight: Dimensions.get('window').height - 200,
      circle0PosY: 0,
      circle1PosY: 0,
      circle2PosY: 0,
      responders: new Array(3) // we populate this array using PanResponder.create() function
    }
  }

  componentWillMount() {
    this.randomiseColors();
    this.attachPanHandlerEvents();
  }

  randomiseColors() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const percentage = this.state.areaHeight / 255;

    bgColor = [r, g, b];

    this.setState({
      bgColor,
      circle0Left: (Dimensions.get('window').width / 4) - 25,
      circle1Left: (Dimensions.get('window').width / 2) - 25,
      circle2Left: ((Dimensions.get('window').width / 4) * 3) - 25,
      circle0PosY: (percentage * r) + 0,
      circle1PosY: (percentage * g) + 0,
      circle2PosY: (percentage * b) + 0,
    })

    this.state.pan.one.setOffset({x: 0, y: (percentage * r) + 0});
    this.state.pan.one.flattenOffset()
    this.state.pan.two.setOffset({x: 0, y: (percentage * g) + 0});
    this.state.pan.two.flattenOffset()
    this.state.pan.three.setOffset({x: 0, y: (percentage * b) + 0});
    this.state.pan.three.flattenOffset()
  }

  // we loop through 3 circles to create 3 seperate pan responders
  attachPanHandlerEvents() {
    for(let i = 0; i < this.state.responders.length; i++) {

      const selector = this.state.pan[Object.keys(this.state.pan)[i]];

      this.state.responders[i] = PanResponder.create({
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,

        onPanResponderGrant: (e, gestureState) => {
          selector.setOffset({x: selector.x._value, y: selector.y._value});
        },

        onPanResponderMove: (e, gestureState) => {
          // here we are setting the position of the gesture move. 
          // This will then re-render the view with the correct
          // background color
          this.setState({
            [`circle${i}PosY`]: gestureState.moveY
          });
  
          Animated.event([null, {
            dy: selector.y
          }])(e, gestureState);
  
          // now we can call the background color and change it.
          this.updateBackgroundColor();
        },

        // on release, if the current cirlce is outside the boundaries we will
        // move it back to the edge of the boundary and then reset the color
        onPanResponderRelease: (e, gestureState) => {
          const boundaryBottom = this.state.areaHeight;
          const boundaryTop = 80;

          if(gestureState.moveY > boundaryBottom) {
            Animated.spring(selector, {
              toValue: { y: boundaryBottom, x: 0 },
              friction: 10
            }).start();

            setTimeout(() => {
              this.setState({
                [`circle${i}PosY`]: boundaryBottom 
              });

              selector.flattenOffset();
              this.updateBackgroundColor();
            }, 0)
          } else if(gestureState.moveY < boundaryTop) {
            Animated.spring(selector, {
              toValue: { y: boundaryTop, x: 0 },
              friction: 10
            }).start();

            setTimeout(() => {
              this.setState({
                [`circle${i}PosY`]: 0
              });

              selector.flattenOffset();
              this.updateBackgroundColor();
            }, 0) 
          } else {
            selector.flattenOffset();
          }
        }
      });
    }
  }

  // getting the correct RGB values using the position of each of the circles
  updateBackgroundColor() {
    const colors = 255;
    const h = this.state.areaHeight;
    let r = Math.round((colors / h) * this.state.circle0PosY);
    let g = Math.round((colors / h) * this.state.circle1PosY);
    let b = Math.round((colors / h) * this.state.circle2PosY);

    // if we drag the circle further than the boundary it will give a value greater than 255
    // we want to correct this
    r  = r > 255 ? 255 : r;
    g  = g > 255 ? 255 : g;
    b  = b > 255 ? 255 : b;

    this.setState({
      bgColor: [r, g, b]
    });
  }

  render() {
    let circle = {};

    // here we are looping through each pan and getting the translate and translateY for each one
    for(let i = 0; i < this.state.responders.length; i++) {
      const currentPan = this.state.pan[Object.keys(this.state.pan)[i]];  
      const translateX = this.state[`circle${i}Left`];
      const translateY = currentPan.y;

      circle[`circleStyle${i}`] = {
        transform: [{translateY}, {translateX}]
      }
    }

    return (
      <View style={styles.container}>
        <View
          style={
            [
              styles.colorPickerContainer,
              { 'backgroundColor': `rgb(${this.state.bgColor[0]}, ${this.state.bgColor[1]}, ${this.state.bgColor[2]})`}
            ]}>

            {
              this.state.responders.map((pan, index) => {
                return (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.colorPicker,
                      circle[`circleStyle${index}`]]}
                      {...this.state.responders[index].panHandlers}>
                  </Animated.View>
                )
              })
            }
            <View style={styles.colorCodeSection}>
              <Text style={styles.colorCodeSectionText}>
                {this.state.bgColor[0]}{' ,  '}
                {this.state.bgColor[1]}{' ,  '} 
                {this.state.bgColor[2]}
              </Text>
            </View>
        </View>
      </View>
    );
  }
}
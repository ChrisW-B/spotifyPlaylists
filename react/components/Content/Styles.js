import styled, { keyframes } from 'emotion/react';

const MoveInRight = keyframes `
  0% {
    transform: translate3d(100%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const MoveOutRight = keyframes `
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(100%, 0, 0);
  }
`;
const materialAnimation = 'cubic-bezier(0.4, 0, 0.2, 1)';
const transitionOut = `, 300ms ${MoveOutRight} ${materialAnimation}`;
const transitionIn = `, 300ms ${MoveInRight} ${materialAnimation}`;

export default styled.div `
  animation: ${({status}) => status === 'entering' ? transitionIn : status === 'exiting' ? transitionOut : ''};
`;
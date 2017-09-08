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

const transitionOut = `, 300ms ${MoveOutRight} cubic-bezier(0.4, 0, 0.2, 1)`;
const transitionIn = `, 300ms ${MoveInRight} cubic-bezier(0.4, 0, 0.2, 1)`;

export default styled.div `
  animation: ${({status}) => status === 'entering' ? transitionIn : status === 'exiting' ? transitionOut : ''};
  display: flex;
  flex-direction: column;
  height: 100vh;
`;
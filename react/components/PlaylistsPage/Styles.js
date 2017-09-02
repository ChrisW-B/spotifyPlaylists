import styled, { keyframes } from 'styled-components';

const MoveInRight = keyframes`
  0% {
    transform: translate3d(100%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const MoveOutRight = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(100%, 0, 0);
  }
`;

export const PlaylistsPageWrapper = styled.div`
  animation: ${props => props.status === 'entering' ? `300ms ${MoveInRight} cubic-bezier(0.4, 0, 0.2, 1)` : props.status === 'exiting' ? `300ms ${MoveOutRight} cubic-bezier(0.4, 0, 0.2, 1)` : ''};
  display: flex;
  flex-direction: column;
  height: 100vh;
`;
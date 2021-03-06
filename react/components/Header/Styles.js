import styled, { keyframes } from 'react-emotion';

const Expand = keyframes `
  0% {
    font-size: 0;
    padding: 0;
    width: 0;
  }
  100% {
    padding: 0 20px 0 0;
    width: 50px;
  }
`;

const Contract = keyframes `
  0% {
    padding: 0 20px 0 0;
    width: 50px;
  }
  100% {
    font-size: 0;
    padding: 0;
    width: 0;
  }
`;

const Bounce = keyframes `
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40% {
    transform: translate3d(0, 5px, 0);
  }
  60% {
    transform: translate3d(0, 2.5px, 0);
  }
`;

const materialAnimation = 'cubic-bezier(0.4, 0, 0.2, 1)';
const transitionOut = `300ms ${Contract} ${materialAnimation}`;
const transitionIn = `300ms ${Expand} ${materialAnimation}`;
const clickedAnimation = `2s ${materialAnimation} ${Bounce}`
export const Wrapper = styled.div `
  align-items: center;
  background: var(--oc-gray-0);
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 10px;
`;

export const ProfilePhoto = styled.img `
  animation: ${({clicked}) => clicked ? clickedAnimation : ''};
  border-radius: 50px;
  cursor: pointer;
  height: 50px;
  width: 50px;
`;

export const WelcomeText = styled.h3 `
  margin: 0;
  text-align: center;

  @media (max-width: 600px) {
    flex: 1 1 auto;
  }
`;

export const HeaderButton = styled.button `
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--oc-blue-2);
  border-radius: 0;
  cursor: pointer;
  font-size: 14px;
  margin: 5px;
  min-height: 30px;
  padding: 0;
`;

export const HeaderSpan = styled.span `
  display: flex;
  justify-content: ${({right}) => right ? 'flex-end' : 'flex-start'};
  width: 180px;

  @media (max-width: 600px) {
    flex: ${({right}) => right ? '1 1 100%' : '0'};
    justify-content: ${({right}) => right ? 'space-around' : 'flex-start'};
  }
`

export const LogOutButton = styled(HeaderButton)`
  border-bottom: 2px solid var(--oc-red-2);
`

export const AdminButton = styled(HeaderButton)`
  border-bottom: 2px solid var(--oc-orange-2);
`

export const BackButton = styled.button `
  animation: ${({status}) => status === 'entering' ? transitionIn : status === 'exiting' ? transitionOut : ''};
  background: transparent;
  border: 0;
  color: var(--oc-blue-4);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 30px;
  padding: 0 20px 0 0;
  place-content: center;
  place-items: center;
`

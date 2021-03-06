import styled, { keyframes } from 'react-emotion';

const AnimateBG = keyframes `
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -500em 0;
  }
`;

const MoveOutLeft = keyframes `
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-100%, 0, 0);
  }
`;

const MoveInLeft = keyframes `
  0% {
    transform: translate3d(-100%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const materialAnimation = 'cubic-bezier(0.4, 0, 0.2, 1)';
const transitionOut = `, 300ms ${MoveOutLeft} ${materialAnimation}`;
const transitionIn = `, 300ms ${MoveInLeft} ${materialAnimation}`;

export const LoginBackground = styled.div `
  align-items: left;
  animation: 100s ${AnimateBG} linear infinite ${({status}) => status === 'exiting' ? transitionOut : status === 'entering' ? transitionIn : ''};
  background: repeating-linear-gradient(140deg, #FA8BFF 0%, #2BFF88 35%, #2BD2FF 65%, #FA8BFF 81%);
  background-color: #00dbde;
  background-position: 50em 0;
  background-size: 500em 100em;
  bottom: 0;
  display: flex;
  flex-direction: column;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

export const SpotifyButton = styled.button `
  background: transparent;
  border: none;
  cursor: pointer;
  justify-self: center;
`;

export const TextWrapper = styled.h1 `
  line-height: 1.7;
  max-width: 420px;
`;

export const TitleWrapper = styled(TextWrapper)`
  max-width: 600px;
`;

const TextWithBg = styled.span `
  background-color: white;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  box-shadow: 0 0 7px -3px #444;
  color: black;
  display: inline;
  padding: 5px;
  padding-left: 20px;
`;

export const WelcomeText = styled(TextWithBg)`
  font-size: 45px;
  font-weight: 700;
  padding-right: 10px;
`;

export const Description = styled(TextWithBg)`
  font-size: 18px;
  font-weight: 400;
  padding: 10px 10px 10px 20px;
`;

export const PlaylistTitle = styled.i `
  color: #666;
  font-style: normal;
`;

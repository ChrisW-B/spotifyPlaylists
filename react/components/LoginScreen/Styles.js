import style, { keyframes } from 'styled-components';

const AnimateBG = keyframes `
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 500em 0;
  }
`;

export const LoginBackground = style.div `
  align-items: left;
  animation: 100s ${AnimateBG} linear infinite;
  background: repeating-linear-gradient(140deg, #FA8BFF 0%, #2BFF88 35%, #2BD2FF 65%, #FA8BFF 81%);
  background-color: #00dbde;
  background-position: 50em 0;
  background-size: 500em 100em;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

export const SpotifyButton = style.button `
  background: transparent;
  border: none;
  cursor: pointer;
  justify-self: center;
`;

export const TextWrapper = style.h1 `
  line-height: 1.7;
  max-width: ${props=> props.primary ? '600px': '420px'};
  & > * {
    background-color: white;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    box-shadow: 0 0 7px -3px #444;
    color: black;
    display: inline;
    padding: 5px;
  }
`;

export const WelcomeText = style.span `
  font-size: 45px;
  font-weight: 700;
  padding-left: 20px;
  padding-right: 10px;
`;

export const Description = style.span `
  font-size: 18px;
  font-weight: 400;
  padding: 10px;
  padding-left: 20px;
  & i {
    color: #666;
    font-style: normal;
  }
`;
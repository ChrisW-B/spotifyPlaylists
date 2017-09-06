import styled from 'emotion/react';

export const Wrapper = styled.div `
  align-items: center;
  background: var(--oc-gray-0);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
`;

export const ProfilePhoto = styled.img `
  border-radius: 50px;
  height: 50px;
  width: 50px;
`;

export const WelcomeText = styled.h3 `
  margin: 0;
  text-align: center;
`;

export const HeaderButton = styled.button `
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--oc-blue-2);
  border-radius: 0;
  cursor: pointer;
  font-size: 14px;
  margin: 5px;
  padding: 0;
`;

export const HeaderSpan = styled.span `
  display: flex;
  justify-content: ${({right}) => right ? 'end' : 'start'};
  width: 250px;

  @media (max-width: 650px) {
    flex-direction: column;
  }
`

export const LogOutButton = styled(HeaderButton)`
  border-bottom: 2px solid var(--oc-red-2);
`
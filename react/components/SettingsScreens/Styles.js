import styled from 'emotion/react';

const materialAnimation = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const Button = styled.button `
  background: var(--oc-red-5);
  border: 0;
  border-radius: 200px;
  color: var(--oc-gray-0);
  cursor: pointer;
  font-size: 16px;
  height: 50px;
  padding: 0 20px;
  transition: background 300ms ${materialAnimation}, box-shadow 300ms ${materialAnimation};

  &:hover {
    background: var(--oc-red-8);
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

export const ButtonGroup = styled.div `
  display: flex;
  flex-flow: row wrap;
  margin: 0 20px;
  padding: 20px;
  place-content: space-between;

  &:last-child {
    border-top: 1px solid var(--oc-gray-1);
  }
`

export const Title = styled.h1 `
  border-bottom: 2px solid ${({settings}) => settings ? 'var(--oc-blue-2)' : 'var(--oc-yellow-2)'};
  margin: 0;
`

export const Description = styled.p `
  font-size: 16px;
`

export const Container = styled.div `
  display: flex;
  flex-direction: column;
  margin: 50px 10%;
  place-content: center;
`
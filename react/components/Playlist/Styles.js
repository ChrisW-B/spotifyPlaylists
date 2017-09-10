import styled from 'emotion/react';

const colorTransition = '.75s cubic-bezier(0.4, 0, 0.2, 1)'

const ListItem = styled.li `
  border: 1px solid var(--oc-green-8);

  &:not(:first-child) {
    border-top: 0;
  }
`

export const PlaylistDetail = styled(ListItem)`
  margin: 0;
  padding: 10px;
`

export const PlaylistInfo = styled(ListItem)`
  background-color: ${({on}) => on ? 'var(--oc-green-2)' : 'var(--oc-red-2)'};
  display: flex;
  min-height: 62px;
  place-items: stretch;
  transition: background-color ${colorTransition};
`;

export const PlaylistTitle = styled.p `
  flex: 1 1 auto;
  padding: 5px;
`;

export const Button = styled.a `
  background: ${({settings}) => settings ? 'var(--oc-blue-0)' : 'transparent'};
  border-left: ${({settings}) => settings ? '1px solid var(--oc-blue-5)' : '0'};
  color: ${({settings, on}) => settings ? 'var(--oc-blue-4)' : on ? 'var(--oc-green-7)' : 'var(--oc-red-7)'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 30px;
  min-width: 45px;
  padding: 0 10px;
  place-content: center;
  place-items: center;
  position: relative;
  transition: color ${colorTransition};
  width: 50px;

  svg {
    font-size: 28px;
    padding: 4px;
  }

  &:hover > span {
    opacity: 1;
  }
`;

export const ButtonDescription = styled.span `
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  padding: 5px;
  position: absolute;
  text-align: center;
  top: -2px;
  transition: opacity 0.33s;
  width: 60px;
`;

export const Toggle = styled.span `
  display: flex;
  flex-direction: column;
  place-content: center;
  place-items: center;
`;
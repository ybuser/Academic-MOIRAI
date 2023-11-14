import styled, {css} from 'styled-components'

export const DefaultButton = styled.button`
background-color:  ${({red}) => (red && 'red') || '#645cfc'};
border: none;
color: white;
display: block;
margin: 10px;
${({large}) => large? css`
        padding: 15px;
        font-weight: 800;
    ` 
    : 
    css`
        padding: 10px;
        font-weight: 400;
    `
}
`

export const ExtendedButton = styled(DefaultButton)`
display: block;
width: 100vw;
`
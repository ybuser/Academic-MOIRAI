import React from 'react';
import styled from 'styled-components';

const formatDateToYear = (datetimeString) => {
    const bc = datetimeString.startsWith('-');
    const year = bc ? datetimeString.slice(1).split("-")[0] : datetimeString.split("-")[0];
    return Math.abs(parseInt(year)) + (bc ? " B.C." : " A.D.");
  };

const InfoWrapper = styled.div`
    flex: 1; 
    max-width: 50%; 
    display: block;
    padding: 1rem;
    overflow: hidden;
    overflow-y: auto;
    height: 360px; /* Set a fixed height */
    text-align: left;
`;

const FactP = styled.div`
    margin: 20px 0px 0px 0px;
    text-align: left;

    h4 {
        margin: 4px;
        font-weight: bold;
    }

    p {
        margin: 4px;
        font-weight: bold;
    }
`;
const DetailFacts = ({ philosopherDetails }) => {
    // Check if philosopherDetails and its properties are defined
    const occupation = philosopherDetails && philosopherDetails.occupation ? Object.values(philosopherDetails.occupation).map(value => value['name']).join(', ') : '';
    const movement = philosopherDetails && philosopherDetails.movement ? Object.values(philosopherDetails.movement).map(value => value['name']).join(', ') : '';
    const notableWork = philosopherDetails && philosopherDetails.notableWork ? Object.entries(philosopherDetails.notableWork).sort(([, valueA], [, valueB]) => {
        const idA = parseInt(valueA['id'].substring(1));
        const idB = parseInt(valueB['id'].substring(1));
        return idA - idB;
    }).slice(0, 5) : [];

    return (
        <InfoWrapper id='detailInfo'> 
            <img 
            src={`data/images/${philosopherDetails.id}.jpg`} 
            alt="Philosopher Image" 
            style={{
                float: 'right',
                margin: '0',
                marginLeft: '1rem',
                marginBottom: '1rem',
                width: '100px',
                objectFit: 'contain',
                alignSelf: 'flex-start',
                display: 'block',
            }}
            />
            <h2 style={{ margin: '4px', textAlign: 'left' }}>
                {philosopherDetails.name}
            </h2>
            {/* <p style={{ margin: '4px' , textAlign: 'left' }}>
                {`(${formatDateToYear(philosopherDetails.dateOfBirth[0])} - ${formatDateToYear(philosopherDetails.dateOfDeath[0])})`}
            </p> */}

            <p style={{ margin: '4px' , textAlign: 'left' }}>
                {philosopherDetails.desc}
                <a style={{ margin: '4px', textAlign: 'left' }} href={philosopherDetails.wiki_link} target="_blank">[Wikipedia]</a>
            </p>

            {
                philosopherDetails.occupation && philosopherDetails.occupation[0] && philosopherDetails.occupation[0] !== 'None' &&
                <FactP>
                    <h4>Occupation</h4>
                    <p style={{ fontWeight: 'normal' }}>
                        {Object.values(philosopherDetails.occupation).slice(0, 5).map(value => value['name']).join(', ')}
                    </p>
                </FactP>
            }

            {
                philosopherDetails.fieldOfWork && philosopherDetails.fieldOfWork[0] && philosopherDetails.fieldOfWork[0] !== 'None' &&
                <FactP>
                    <h4>Field of Work</h4>
                    <p style={{ fontWeight: 'normal' }}>
                        {Object.values(philosopherDetails.fieldOfWork).slice(0, 5).map(value => value['name']).join(', ')}
                    </p>
                </FactP>
            }

            {
                movement !== "" &&
                <FactP>
                    <h4>Movements</h4>
                    <p style={{ fontWeight: 'normal' }}>{movement}</p>
                </FactP>
            }

            {
                philosopherDetails.notableWork && philosopherDetails.notableWork[0] && philosopherDetails.notableWork[0] !== 'None' &&
                <FactP>
                    <h4>Notable Works</h4>
                    {notableWork.map(([key, value]) => (
                        <div key={key}>
                            <p style={{ fontWeight: 'normal' }}>{value['name']}</p>
                        </div>
                    ))}
                </FactP>
            }
            

            
        </InfoWrapper>
    );
};

export default DetailFacts;

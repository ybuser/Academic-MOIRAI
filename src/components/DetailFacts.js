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
    max-height: calc(100% - 120px); /* Adjust based on your layout */
    overflow-y: auto;
    height: 400px; /* Set a fixed height */
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

    return (
        <InfoWrapper id='detailInfo'> 
            <img 
            src={`data/images/${philosopherDetails.id}.jpg`} 
            alt="Philosopher Image" 
            style={{
                float: 'right',
                margin: '0',
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

            <p style={{ margin: '4px' , textAlign: 'left' }}>{philosopherDetails.desc}</p>

            <p style={{ fontWeight: 'normal' }}>
                {Object.values(philosopherDetails.occupation).join(', ')}
            </p>

            <FactP>
                <h4>Movements</h4>
                <p style={{ fontWeight: 'normal' }}>
                    {Object.values(philosopherDetails.movement).join(', ')}
                </p>
            </FactP>

            <FactP>
                <h4>Notable Works</h4>
                {Object.entries(philosopherDetails.notableWork).map(([key, value]) => (
                    <div key={key}>
                        <p style={{ fontWeight: 'normal' }}>{value}</p>
                    </div>
                ))}
            </FactP>
        </InfoWrapper>
    );
};

export default DetailFacts;

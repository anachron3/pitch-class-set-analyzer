import React from 'react';

const SetList = (props) => {
    return (
        <div>
            Notes selected:<br/>
                <div class="ui buttons">
                {
                    props.noteNamesOn.map((note, index) => {
                        return <button class="ui button" key={index}>{note}</button>
                    }
                    )
                }
                </div>
        </div>
    )
}

export default SetList;
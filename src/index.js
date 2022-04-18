import React from 'react';
import ReactDOM from 'react-dom';
import { Piano, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import Analyzer from './Analyzer';
import SetList from './SetList';

const noteRange = {
    first: MidiNumbers.fromNote('c3'),
    last: MidiNumbers.fromNote('b3')
  };

// Using a single octave to designate pitch class...
const numberToNote = {
    48: 'C',
    49: 'C#',
    50: 'D',
    51: 'D#',
    52: 'E',
    53: 'F',
    54: 'F#',
    55: 'G',
    56: 'G#', 
    57: 'A',
    58: 'A#',
    59: 'B'
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { listMidi: [], listNames: [], updated: false };
    }

    playNote = (midiNumber) => {
        // This is a set of pitch classes... we allow
        // each note only one time maximum.
        if(!this.state.listMidi.includes(midiNumber)){
            this.setState({ listMidi: [...this.state.listMidi, midiNumber]});
            this.setState({ listNames: [...this.state.listNames, numberToNote[midiNumber]]});
        }

        console.log(numberToNote[midiNumber]);
        this.setState({updated:true});
        console.log(this.state.list);
        return null;
    };

    stopNote = (midiNumber) =>
    {   
        return null;
    };

    onClearNotes = () =>
    {
        this.setState({listNames: [], listMidi: []});
    }

    render() {
        return (
        <div> 
            <div class="ui divider"></div>
            <div class="ui container">
                <b>Set Analyzer, v0.5</b><br/><br/>
                <i>Input a pitch-class set using the keyboard below.<br/>
                Once finished, click the "Compute set characteristics" button!</i>
            </div>
            <div class="ui divider"></div>
            <Analyzer 
                noteNamesOn={this.state.listNames}
                noteNumbersOn={this.state.listMidi}/>
            <div class="ui divider"></div>
            <div class="ui container">
            <SetList
                noteNamesOn={this.state.listNames}/>
            <Piano
                noteRange={noteRange}
                width={660}
                playNote={this.playNote}
                stopNote={this.stopNote}
            /> 
            <button type="button" onClick={this.onClearNotes}>
                Clear notes
            </button>
            
            </div>
            <div class="ui divider"></div>
        </div>
        )
    };
    
}


ReactDOM.render(
    <App />,
    document.querySelector('#root')
)
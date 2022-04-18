import React from 'react';
import setToFN from './ForteNames';

/* This class is the meat of the SetAnalyzer.  Given a set of
    notes, it computes its representation in zero-based pitch
    class set notation, and then when the user clicks a button,
    it calculates:
        normal form (most compact permutation of the set),
        prime form (zero based normal form OR its inversion),
        forte number (its taxonomy according to theorist Forte), and
        interval class vector (a vector counting its internal intervals).

    The class updates its state if the set props from the parent change,
    since the user now wants to do another computation.
*/

// Numerical notation for atonal music, where 0 represents
// the pitch class C, 1 represents C#/Db, etc.
const noteToSet = {
    'C' : 0,
    'C#' : 1,
    'D' : 2,
    'D#' : 3,
    'E' : 4,
    'F' : 5,
    'F#' : 6,
    'G' : 7,
    'G#' : 8,
    'A' : 9,
    'A#' : 10,
    'B' : 11
}

class Analyzer extends React.Component
{

    // utility function as JS doesn't support modulo operator (dude?)
    mod(value, mod) {
        return ((value % mod) + mod) % mod;
    }

    constructor(props) {
        super(props);
        this.state = {  normalForm: "", 
                        primeForm: "", 
                        icVector: "", 
                        forteName: "", 
                        zMate: "None", 
                        ic_pairs: [] };
        this.onCompute = this.onCompute.bind(this);
        this.computeSetNotation = this.computeSetNotation.bind(this);
        this.computeNormalForm = this.computeNormalForm.bind(this);
        this.computePrimeForm = this.computePrimeForm.bind(this);
        this.computeForteName = this.computeForteName.bind(this);
        this.computeICVector = this.computeICVector.bind(this);
        this.permutetwos = this.permutetwos.bind(this);
    }

    // If the props have changed, we're now looking at a different set.
    // In this case, reset state back to initial, wait for the user to 
    // say they're done with input via the onClick.

    componentDidUpdate(prevProps) {
        if(this.props.noteNamesOn !== prevProps.noteNamesOn)
        {
            this.setState({     normalForm: "", 
                                primeForm: "", 
                                icVector: "", 
                                forteName: "", 
                                zMate: "None", 
                                ic_pairs: [] });
        }
    }

    // This takes the props from parent and returns the 
    // set in zero-based set notation.
    computeSetNotation() {
        let set = [];
        for(let x in this.props.noteNamesOn) {
            set.push(noteToSet[this.props.noteNamesOn[x]]);
        }
        return (
                <span>{set.join(' ')}</span>
        )
    }

    // We may need to normalize sets for other operations, so 
    // separating this function out...
    normalize(arr) {
        let size = 0;
        let smallest = 13;
        let smallest_index = 0;
        let tying_index = 0;

        for(let y=0; y<arr.length; y++) {
            size = this.mod((arr[arr.length-1]-arr[0]), 12);
            if(size<smallest){
                smallest = size;
                smallest_index = y;
            }
            if(size == smallest){
                // we have a tie!
                // we'll store this index to compare later
                tying_index = y;
            }
            // rotate the array
            arr.push(arr.shift());
        }

        if(tying_index>0){ 
            // compare the first to penultimate values
            // to establish the tiebreaker
            let comparison1 = this.mod(smallest_index-2, arr.length);
            let comparison2 = this.mod(tying_index-2, arr.length);
            if( (arr[comparison1]-arr[smallest_index]) > 
                    (arr[comparison2]-arr[tying_index]) ) {
                        console.log("here");
                        smallest_index = tying_index;
                    }
        }
        // re-arrange the array into its most compact permutation
        // (rotate it, using shift, up to the smallest_index)
        for(let i=0; i<smallest_index; i++){
            arr.push(arr.shift());
        }
    }

    computeNormalForm()
    {
        // find the "most compact" form of the set
        // (the smallest from lowest to highest).
        // n.b.: distance from 10-2 is 4 (all math is mod12)

        let sorted = Array.from(this.props.noteNumbersOn.sort(function(a,b){return a-b}));
        for(let x in sorted) {
            sorted[x] = sorted[x]-48; // zero-based set
        }

        this.normalize(sorted);
        this.setState({ normalForm: sorted.join(' ') }, this.computePrimeForm);
    }

    computePrimeForm() {
        // There are two candidates for a given set's prime form:
        //   1.  Normal form, but transposed to zero (retaining structure), or,
        //   2.  The inversion (TnI, in set theory terms) of #1.
        // Best candidate is most compact to the left.

        if(this.state.normalForm==="") { return null; }

        // Copy normal form into a new array, and manipulate.
        // normalForm has spaces in it for display reasons, so
        // strip those out before we manipulate
        let prime1 = Array.from(this.state.normalForm.split(' '));
        let first_element = Object.assign(prime1[0]);
        prime1 = prime1.filter((item) => item !== " ");
        for(let i=0; i<prime1.length; i++)
        {
            prime1[i] = this.mod(prime1[i]-first_element,12);
        }
        // sort it and normalize it
        prime1 = prime1.sort(function(a,b){return a-b});
        
        // We've got candidate #1.  Invert it (12-n for all elements),
        // then transpose it to zero, then see which is more compact.
        let prime2 = Array.from(prime1);
        
        // Invert the pitch classes around 0.
        for(let x in prime2) {
            prime2[x] = this.mod(12-prime2[x], 12);
        }

        // Sort it, normalize it, and set first element to zero,
        // preserving structure.
        prime2 = prime2.sort(function(a,b){return a-b});
        this.normalize(prime2);
        first_element = prime2[0];
        for(let i=0; i<prime2.length; i++)
        {
            prime2[i] = this.mod(prime2[i]-first_element,12);
        }

        // If there's only one element of the set, do nothing. 
        // Otherwise, find the most compact set to the
        // left.

        if(prime1.length==1) { this.setState({primeForm: prime1}); }
        else {
            if(prime1.length>2 && (prime1[1]-prime1[0]) === (prime2[1]-prime2[0])){
                // there's a tie, check the next element
                if((prime1[2]-prime1[0]) < (prime2[2]-prime2[0])){
                    this.setState({primeForm: prime1.join(' ')}, this.computeForteName);
                }
                else{
                    this.setState({primeForm: prime2.join(' ')}, this.computeForteName); 
                }
            }
            else{
                if( (prime1[1]-prime1[0]) < (prime2[1]-prime2[0]) ){

                    this.setState({primeForm: prime1.join(' ')}, this.computeForteName);
                }
                else{ 
                    this.setState({primeForm: prime2.join(' ')}, this.computeForteName); 
                }
            }
        }

    }

    computeForteName() {
        // This one is just a lookup! Huzzah!
        // Sets of less than three elements do not have Forte names.

        if(this.state.primeForm.length < 5) { // ... with spaces
            this.setState({ forteName: "(Set does not have a Forte name.)"}, this.computeICVector)
        }
        else {
            this.setState({ forteName: setToFN[this.state.primeForm]}, this.computeICVector);
        }
    }

    permutetwos(arr, temp, start, end, index)
    {
        if(index==2)
        {
            for(let i=0; i<2; i++)
            {
                this.state.ic_pairs.push(temp[i]);
            }
        }

        for(let j=start; j<=end && end-j+1 >= 2-index; j++)
        {
            temp[index] = arr[j];
            this.permutetwos(arr, temp, j+1, end, index+1);
        }

    }

    computeICVector() {
        // An interval class vector always has 6 elements; 
        // each is a count of the intervals present in the set,
        // where complementary intervals (4 and 8, for example)
        // are counted in the same "bucket", as they are inversions
        // of each other, and we hear them similarly.

        // We could look this up like we do the Forte names, but
        // what's the fun in that?

        // Permute all possible combinations, store in an array.
        // then use that array like a queue and generate distances,
        // storing them in the vector.

        let vector = [0, 0, 0, 0, 0, 0];
        let arr = Array.from(this.state.primeForm.split(' '));
        let data = new Array(2);
        this.permutetwos(arr, data, 0, arr.length-1, 0);

        let k = Object.assign(this.state.ic_pairs.length/2);
        for(let i=0; i<k; i++)
        {
            let distance = this.state.ic_pairs[1]-this.state.ic_pairs[0];
            switch(distance)
            {
                case 1:
                case 11:
                    vector[0]++;
                    break;
                case 2:
                case 10:
                    vector[1]++;
                    break;
                case 3:
                case 9:
                    vector[2]++;
                    break;
                case 4:
                case 8:
                    vector[3]++;
                    break;
                case 5:
                case 7:
                    vector[4]++;
                    break;
                case 6:
                    vector[5]++;
                    break;
            }
            // remove the first two elements and iterate
            this.state.ic_pairs.shift();
            this.state.ic_pairs.shift();
        }
        this.setState({ icVector: vector });
    }

    onCompute() {
        // computeNormalForm will be called first, but each function needs the
        // result of the previous step.  Therefore, we'll call the first one here,
        // but then use callbacks from setState to do the rest.
        this.computeNormalForm();
    }

    render() {

        return (
            <div class="ui container">
                Original set: {this.computeSetNotation()}<br/>
                Normal form: [{this.state.normalForm}]<br/>
                Prime form: ({this.state.primeForm})<br/>
                Forte name: {this.state.forteName}<br/>
                Interval class vector: {this.state.icVector}<br/>
                <br/>
                <button type="button" onClick={this.onCompute}>
                Compute set characteristics
                </button><br/>
            </div>
        )
    }
}

export default Analyzer
import "./TranslucentSpinner.css"
import * as Spinner from 'react-spinners';

export default function TranslucentSpinner() {
  return (
    <div className="spinner-container">
      <Spinner.BeatLoader color="#3850c7" loading={true} size={15} />
    </div>
  );
}
import axios from "axios";
import SparkMD5 from "spark-md5";
import Q from "q";
import React, { Component } from "react";
class App extends Component {
   calculateMD5Hash(file, bufferSize) {
    var def = Q.defer();
  
    var fileReader = new FileReader();
    var fileSlicer = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    var hashAlgorithm = new SparkMD5();
    var totalParts = Math.ceil(file.size / bufferSize);
    var currentPart = 0;
    var startTime = new Date().getTime();
  
    fileReader.onload = function(e) {
      currentPart += 1;
  
      def.notify({
        currentPart: currentPart,
        totalParts: totalParts
      });
  
      var buffer = e.target.result;
      hashAlgorithm.appendBinary(buffer);
  
      if (currentPart < totalParts) {
        processNextPart();
        return;
      }
  
      def.resolve({
        hashResult: hashAlgorithm.end(),
        duration: new Date().getTime() - startTime
      });
    };
  
    fileReader.onerror = function(e) {
      def.reject(e);
    };
  
    function processNextPart() {
      var start = currentPart * bufferSize;
      var end = Math.min(start + bufferSize, file.size);
      fileReader.readAsBinaryString(fileSlicer.call(file, start, end));
    }
  
    processNextPart();
    return def.promise;
  }
     
  state = {
    // Initially, no file is selected
    selectedFile: null,
    fileHash: "0x00"
  };

  // On file select (from the pop up)
  onFileChange = (event) => {
    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
  };

  // On file upload (click the upload button)
  onFileUpload = () => {
    // Create an object of formData
    const formData = new FormData();

    // Update the formData object
    formData.append(
      "file",
      this.state.selectedFile,
      this.state.selectedFile.name
    );

    // Details of the uploaded file
    console.log(this.state.selectedFile);

    axios.post("http://localhost:8080/upload", formData);
  };

  // File content to be displayed after
  // file upload is complete
  fileData = () => {

    if (this.state.selectedFile) {
      var file = this.state.selectedFile;
      var bufferSize = Math.pow(1024, 2) * 10; // 10MB
    
      this.calculateMD5Hash(file, bufferSize).then(res => {
      this.setState({ ...this.state, fileHash: res.hashResult });
    })

      return (
        <div>
          <h2>File Details:</h2>
          <p>File Name: {this.state.selectedFile.name}</p>
          <p>File Type: {this.state.selectedFile.type}</p>
          <p>File Hash: {this.state.fileHash}</p>
          <p>
            Last Modified:{" "}
            {this.state.selectedFile.lastModifiedDate.toDateString()}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };

  render() {
    return (
      <div className="App">
        <h1>Upload</h1>
        <h3>File Upload using React!</h3>
        <div>
          <input type="file" onChange={this.onFileChange} />
          <button onClick={this.onFileUpload}>Upload!</button>
        </div>
        {this.fileData()}
      </div>
    );
  }
}

export default App;

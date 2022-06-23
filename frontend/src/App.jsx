import React, { Component } from "react";

class App extends Component {
  state = {
    files: null,
  };

  onFileChange = (event) => {
    this.setState({ files: event.target.files });
  };

  // to generate test files `for i in $(seq 1 10000); do fallocate -l 1M avatar_$i.png ; done` (10k files = 10G)
  // https://w3c.github.io/FileAPI/#dfn-type -> to understand File API
  // TODO: break limits, 2G per file and with 10k file we have a timeout caused by the hash handler
  hash(blob) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      // Hash handler
      fileReader.addEventListener("load", () => {
        // https://caniuse.com/cryptography
        crypto.subtle.digest("SHA-1", fileReader.result).then((buffer) => {
          const typedArray = new Uint8Array(buffer);
          resolve(
            Array.prototype.map
              .call(typedArray, (x) => ("00" + x.toString(16)).slice(-2))
              .join("")
          );
        });
      });

      // Error handler
      fileReader.addEventListener("error", () => {
        reject(fileReader.error);
      });

      // Read the file locally
      fileReader.readAsArrayBuffer(blob);
    });
  }

  computeHash = async (event) => {
    const startTime = Date.now();
    event.preventDefault();

    const filteredFiles = {};

    Object.values(this.state.files).forEach(async (file) => {
      const hash = await this.hash(file);

      if (filteredFiles[hash]) {
        filteredFiles[hash] = {
          names: [file.name, ...filteredFiles[hash].names],
          count: filteredFiles[hash].count + 1,
        };
      } else {
        filteredFiles[hash] = {
          names: [file.name],
          count: 1,
        };
      }
    });

    const endTime = Date.now();

    console.log(`Time taken: ${endTime - startTime}ms`);
    console.log(filteredFiles);
  };

  render() {
    return (
      <div className="App">
        <h1>Upload</h1>
        <h3>File Upload using React!</h3>
        <div>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            onChange={this.onFileChange}
          />
          <button onClick={this.computeHash}>Hash</button>
        </div>
      </div>
    );
  }
}

export default App;

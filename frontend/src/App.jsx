import React, { Component } from "react";
import { CarSplitter } from "carbites";
import { CarReader } from "@ipld/car/reader";
import * as dagCbor from "@ipld/dag-cbor";

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
        crypto.subtle.digest("SHA-256", fileReader.result).then((buffer) => {
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

    /*const filteredFiles = {};

    const hashFile = (file) => {
      return new Promise(async (resolve)=> {
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

        resolve('ok')
      })
    }

    const promises = Object.values(this.state.files).map(file=> {
      return hashFile(file)
    });

    await Promise.all(promises)*/

    const targetSize = 1024 * 1024 * 100; // chunk to ~100MB CARs

    // MON GROS CAR FILE 1
    const blob = this.state.files[0];

    // JE LE SPLIT
    const car = await CarSplitter.fromBlob(blob, targetSize);

    console.log(car);

    const carPartsFiles = [];
    for await (const part of car.cars()) {
      const carParts = [];
      for await (const e of part) {
        carParts.push(e)
      }
      carPartsFiles.push(new Blob(carParts, { type: "application/car" }));
    }

    console.log(carPartsFiles);

    //const carFile = new Blob(carParts, { type: "application/car" });
    //console.log("CAR FILE", carFile);

    const endTime = Date.now();

    console.log(`Time taken: ${endTime - startTime}ms`);
    //console.log(filteredFiles);
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

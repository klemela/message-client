import { Component } from '@angular/core';
import {OnInit} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  messages = [];

  constructor(private http: Http) {
  }

  ngOnInit() {
    this.update();
  }

  getUrl() {
    return Observable.of('http://localhost:8080');
  }

  update() {
    this.getUrl()
      .mergeMap(url => this.http.get(url))
      .subscribe(response => {
        this.messages = response.json()
      });
  }

  save(msg) {
    // this.messages.push(msg);
    this.getUrl()
      .mergeMap(url => this.http.post(url, {message: msg}))
      .subscribe(() => this.update());
  }
}

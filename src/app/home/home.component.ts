import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  form = new FormGroup({
    url: new FormControl(
        'www.bbc.com/capital/story/20190319-the-art-of-perseverance-how-gaman-defined-japan',
        Validators.required
    )
  });

  articleText = '';
  dummyText = 'The work day in Tokyo generally starts with a ride through the world’s busiest subway system. About 20 million people take the train in Japan’s capital every day. Calm and orderly behaviour tends to be characteristic of even the biggest crowds in Japan. Visitors from abroad are often surprised by people’s willingness to wait patiently for transport, brand launches and, for example, aid and assistance after the devastating Fukushima earthquake and tsunami, which occurred eight years ago last week.';
  frequency: {};
  constructor(
      private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.frequency = this.getCharFrequency(this.dummyText);
  }

  getCharFrequency(text: string) {
    const frequency = {};
    let characterCount = 0;
    const regEqp = /^[\s!@#$%^&*()_+\-=\[\]{};'’:"\\|,.<>\/?]*$/;
    for (let i = 0; i < text.length; i++) {
      const character = text.charAt(i).toLowerCase();
      if (!regEqp.test(character)) {
        if (frequency[character]) {
          frequency[character]++;
        } else {
          frequency[character] = 1;
        }
      }

      characterCount ++;
    }
    frequency['total'] = characterCount;

    return frequency;
  }

  proccessText(text: string) {
    let proccessedText = '';
    for (let i = 0; i < text.length; i++) {
      const character = text.charAt(i).toLowerCase();
      if (this.frequency[character]) {
        proccessedText += '<span style="font-size: ' + (10 + this.frequency[character]) + 'px">' + text.charAt(i) + '</span>';
      } else {
        proccessedText += text.charAt(i);
      }
    }

    return this.sanitizer.bypassSecurityTrustHtml(proccessedText);
  }

  onSubmit() {
    console.log(this.form.value);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { Article } from '../../models/article.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    form = new FormGroup({
        url: new FormControl(
            'https://www.bbc.com/news/uk',
            [
                Validators.required,
                Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')
            ]
        )
    });
    isLoading = false;
    article: Article | null = null;
    articles: Article[] | null = null;
    article$$: Subscription;
    frequency: {};
    faLink = faExternalLinkAlt;


    constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer
    ) {
    }

    ngOnInit() {
    }

    getCharsFrequency(content: string[]) {
        const frequency = {};
        let characterCount = 0;
        const regEqp = /^[\s!@#$%^&*()_+\-=\[\]{};'’:"\\|,.<>\/?]*$/;
        for (let j = 0; j < content.length; j++) {
            for (let i = 0; i < content[j].length; i++) {
                const character = content[j].charAt(i).toLowerCase();
                if (!regEqp.test(character)) {
                    if (frequency[character]) {
                        frequency[character]++;
                    } else {
                        frequency[character] = 1;
                    }
                }

                characterCount++;
            }
        }
        frequency['total'] = characterCount;

        const frequencyPercent = {};
        for (const property in frequency) {
            if (frequency.hasOwnProperty(property)) {
                frequencyPercent[property] = frequency[property] / frequency['total'] * 100;
                frequencyPercent[property] = Math.round(frequencyPercent[property] * 10) / 10;
            }
        }

        return frequencyPercent;
    }

    proccessText(text: string) {
        let proccessedText = '';
        if (!this.frequency || typeof text === 'undefined') {
            return proccessedText;
        }

        for (let i = 0; i < text.length; i++) {
            const character = text.charAt(i).toLowerCase();
            if (this.frequency[character]) {
                proccessedText += '<span style=" font-size: ' +
                    this.getFontSize(this.frequency[character]) +
                    'px">' + text.charAt(i) + '</span>';
            } else {
                proccessedText += text.charAt(i);
            }
        }

        return this.sanitizer.bypassSecurityTrustHtml(proccessedText);
    }


    getFontSize (x: number): string {
        const size = 60 - (x * 4);
        return size.toString();
    }

    onSubmit() {
        this.isLoading = true;
        this.articles = null;

        this.article$$ = this.http.post('http://localhost:3000/api/article/', this.form.value).subscribe((response: Article[]) => {
            this.articles = response.filter((item) => item.content.length);
            this.articles = this.articles.map((item, key) => {
                console.log(item.title);
                return {...item, id: key};
            });

            if (this.articles.length) {
                this.selectArticle(0);
            }

            this.isLoading = false;
        });
    }

    get url() {
        return this.form.get('url');
    }

    selectArticle(id: number) {
        this.article = null;
        this.frequency = this.getCharsFrequency(this.articles[id].content);
        this.article = this.articles[id];
    }

    ngOnDestroy(): void {
        if (this.article$$) {
            this.article$$.unsubscribe();
        }
    }
}

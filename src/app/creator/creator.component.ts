import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss']
})
export class CreatorComponent implements OnInit {

  /**
   * Content Container which includes Title
   * and Content area
   * @type {ElementRef}
   * @memberof CreatorComponent
   */
  @ViewChild('content') content: ElementRef;


  /**
   * Creates an instance of CreatorComponent.
   * @param {Renderer2} _renderer
   * @memberof CreatorComponent
   */
  constructor(private _renderer: Renderer2) { }

  /**
   * Lifecycle hook on intialization of component
   * Used to put focus on the title of the blog
   * @memberof CreatorComponent
   */
  ngOnInit() {
    this.content.nativeElement.children[0].focus();
  }

  /**
   * Method to autogrow the title bar when input exceeds
   * one line and also decrease size when lines get deleted
   * @param {any} el - The element which we are goint to autogrow (Title)
   * @memberof CreatorComponent
   */
  autoGrow(el) {
    if (el.scrollHeight > el.clientHeight) {
      el.style.height = (el.scrollHeight + 50) + 'px';
    } else {

      // Prevent height from growing when deleting lines.
      el.style.height = '1px';
      el.style.height = el.scrollHeight + 'px';
    }
  }


  /**
   * Format text according to the given command
   * execCommand is used to format the contentEditable area
   * Commands can be - bold, italic, underline etc.
   * @param {string} cmd - Command use to format text
   * @param {string} view - The element which for certain command
   * For insertHTML h1 is used
   * @memberof CreatorComponent
   */
  formatText(cmd: string, view: string) {
    document.execCommand(cmd, false, view);
  }

  /**
   * Insert new image at the caret position or append the
   * image in the container area if caret is not in valid position
   * @memberof CreatorComponent
   */
  insertImage() {
    const link = window.prompt('Insert link of the image');

    // Create the image div with the delete button
    const div = this._renderer.createElement('div');
    this._renderer.addClass(div, 'imageContainer');
    const img = this.createImageElement(link);
    const del = this.createDeleteElement();

    this._renderer.appendChild(div, del);
    this._renderer.appendChild(div, img);

    // Take the element where current selection is
    const curEl = document.getSelection().anchorNode as HTMLElement;

    if (curEl.classList && (this.content.nativeElement.children.length === 2 ||
      curEl.classList.contains('container') ||
      curEl.classList.contains('fakeBox'))) {
      this._renderer.appendChild(this.content.nativeElement, div);
    } else {
      this._renderer.insertBefore(this.content.nativeElement, div, curEl.nextSibling);
    }

    this.addNextEditableBox(div);
  }

  /**
   * Insert video at the caret postion or append video to container
   * if valid caret is not available
   * @memberof CreatorComponent
   */
  insertVideo() {
    const link = window.prompt('Insert link of the video');

    const div = this._renderer.createElement('div');
    this._renderer.addClass(div, 'videoContainer');
    const video = this.createVideoElement(link);
    const del = this.createDeleteElement();
    this._renderer.appendChild(div, del);
    this._renderer.appendChild(div, video);

    const curEl = document.getSelection().anchorNode as HTMLElement;

    if (curEl.classList && (this.content.nativeElement.children.length === 2 ||
      curEl.classList.contains('container') ||
      curEl.classList.contains('fakeBox'))) {
      this._renderer.appendChild(this.content.nativeElement, div);
    } else {
      this._renderer.insertBefore(this.content.nativeElement, div, curEl.nextSibling);
    }

    this.addNextEditableBox(div);
  }


  /**
   * Add the next editable box after insertion of video
   * or image so that user can insert something after this
   * @param {any} el
   * @memberof CreatorComponent
   */
  addNextEditableBox(el) {
    const div = this._renderer.createElement('div');
    this._renderer.addClass(div, 'content');
    this._renderer.setAttribute(div, 'contentEditable', 'true');

    // this._renderer.appendChild(this.content.nativeElement, div);
    this._renderer.insertBefore(this.content.nativeElement, div, el.nextSibling);

    this.deleteEmptyDiv();
  }

  /**
   * Create image element using the give link
   * @param {string} link - the path of the image
   * @returns
   * @memberof CreatorComponent
   */
  createImageElement(link: string) {
    const el = this._renderer.createElement('img');
    this._renderer.addClass(el, 'image');
    this._renderer.setAttribute(el, 'src', link);
    this._renderer.listen(el, 'error', (e) => {
      e.srcElement.src = './assets/image-not-found.png';
    });
    return el;
  }

  /**
   * Create new video element according to the given link
   * @param {string} link - Link of the path of video
   * @returns
   * @memberof CreatorComponent
   */
  createVideoElement(link: string) {
    const video = this._renderer.createElement('iframe');

    const id = this.getVideoId(link);
    if (id === 'error') {
      alert('Please Add valid link');
      return;
    }

    link = 'https://www.youtube.com/embed/' + id;
    this._renderer.setAttribute(video, 'src', link);
    this._renderer.setAttribute(video, 'frameborder', '0');
    this._renderer.addClass(video, 'video');

    return video;
  }


  /**
   * Create a delete element which can be used to
   * delete the image or video element
   * @returns The delete element
   * @memberof CreatorComponent
   */
  createDeleteElement() {
    const el = this._renderer.createElement('i');
    this._renderer.addClass(el, 'fa');
    this._renderer.addClass(el, 'fa-window-close');
    this._renderer.setAttribute(el, 'aria-hidden', 'true');

    // Remove the parent on click of this element
    this._renderer.listen(el, 'click', (e) => {
      const parent = this._renderer.parentNode(e.srcElement);
      this._renderer.removeChild(this.content.nativeElement, parent);
      this.deleteEmptyDiv();
    });
    return el;
  }


  /**
   * Get the video id from the youtube video link
   * @param {string} url - link of the youtube video
   * @returns Id of the youtube video
   * @memberof CreatorComponent
   */
  getVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    } else {
      return 'error';
    }
  }


  /**
   * Delete any extra consective empty blocks
   * @memberof CreatorComponent
   */
  deleteEmptyDiv() {
    const children = this.content.nativeElement.children;
    for (let i = 2; i < children.length; i++) {
      if (children[i].innerHTML === '' && children[i - 1].innerHTML === '') {
        this.content.nativeElement.removeChild(children[i]);
        i--;
      }
    }
  }

}

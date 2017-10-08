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

  isPopupVisible: boolean = false;
  anchorLink: string;
  anchorText: string;

  divToaddAnchorLink;
  curEl: HTMLElement;
  caretPosition: number;

  /**
   * Creates an instance of CreatorComponent.
   * @param {Renderer2} _renderer
   * @memberof CreatorComponent
   */
  constructor(private _renderer: Renderer2) { }

  /**
   * Lifecycle hook on intialization of component
   * Used to put focus on the title of the blog
   * and add eventListener for keydown
   * @memberof CreatorComponent
   */
  ngOnInit() {
    this.content.nativeElement.children[0].focus();
    document.addEventListener('keydown', this.backspaceListener.bind(this));
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
    if (!link) {
      return;
    }

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
    if (!link) {
      return;
    }

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
    this._renderer.setAttribute(div, 'placeholder', 'This is extra Content...');

    // this._renderer.appendChild(this.content.nativeElement, div);
    this._renderer.insertBefore(this.content.nativeElement, div, el.nextSibling);
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
   * To listen to backspace and when div is empty
   * Delete it on furthur backspace
   * @param {any} key
   * @memberof CreatorComponent
   */
  backspaceListener(key) {
    if (key.code === 'Backspace') {
      const curEl = document.getSelection().anchorNode as HTMLElement;
      if (curEl.innerHTML === '' && this.canDelete(curEl)) {
        curEl.remove();
      }
    }
  }

  /**
   * Check whether we can delete current element or not
   * @param {any} el - The element to check
   * @returns
   * @memberof CreatorComponent
   */
  canDelete(el) {

    // Length and children of container
    const len = this.content.nativeElement.children.length;
    const children = this.content.nativeElement.children;

    // If length is 2 or it is last child of container we cannot delete
    if (len === 2 || el === children[len - 1] || el.parent === children[len - 1]) {
      return false;
    }

    // Return true if we can delete
    return true;
  }

  /**
   * Insert an Anchor Link at current caret Position.
   * if caret Position is not valid then insert Anchor 
   * in last content Editable Div
   * @returns 
   * @memberof CreatorComponent
   */
  insertAnchor() {
    const anchorTemplateBegin: string = "<a href=\"";
    const anchorTemplateMiddle: string = "\">";
    const anchorTemplateEnd: string = "</a>";
    var finalInnerHtml: string = "";

    if (!this.anchorLink || !this.anchorText) {
      this.hidePopup();
      return;
    }

    if (this.caretPosition >= 0) {
      for (var index = 0; index < this.divToaddAnchorLink.childNodes.length; index++) {
        var childNode = this.divToaddAnchorLink.childNodes[index];
        var currentText: string

        if (childNode == this.curEl) { // text node where new Link has to be added
          const first = childNode.textContent.substring(0, this.caretPosition);
          const last = childNode.textContent.substring(this.caretPosition);
          currentText = first + anchorTemplateBegin + this.anchorLink + anchorTemplateMiddle + 
            this.anchorText + anchorTemplateEnd + last;
        } else if (childNode.nodeType != 3) { // an anchor node
          currentText = anchorTemplateBegin + childNode.href + anchorTemplateMiddle + childNode.innerText + anchorTemplateEnd;
        } else { // text node
          currentText = childNode.textContent;
        }
        finalInnerHtml = finalInnerHtml + currentText;
      }

      this.divToaddAnchorLink.innerHTML = finalInnerHtml;

    } else {
      const anchor = this.createAnchorElement(this.anchorLink, this.anchorText);
      this._renderer.appendChild(this.divToaddAnchorLink, anchor);
    }

    this.hidePopup();

  }

  /**
   * Create an Anchor Element using given link and Text to display
   * @param {string} link - The link to which this element should refer
   * @param {string} text - The text to display
   * @returns 
   * @memberof CreatorComponent
   */
  createAnchorElement(link: string, text: string) {
    const el = this._renderer.createElement('a');
    this._renderer.setAttribute(el, 'href', link);
    el.innerHTML = text;
    return el;
  }

  /**
   * show the popup to add Anchor Element and
   * also select current div to add this Anchor element,
   * if no valid div is selected then last Editable div is selected
   * @memberof CreatorComponent
   */
  showPopup() {
    // Select the element where current selection is
    const curEl = document.getSelection().anchorNode as HTMLElement;
    const parentElem = curEl.parentElement;
    
    if (parentElem.classList && parentElem.classList.contains('content')) {
      this.curEl = curEl;
      this.divToaddAnchorLink = parentElem;
      this.caretPosition = document.getSelection().anchorOffset;
    } else {
      // last contentEditable Div 
      this.divToaddAnchorLink = this.content.nativeElement.lastElementChild as HTMLElement;
    }
    this.isPopupVisible = true;
  }

  /**
   * hide the popup to add Anchor Element
   * and clear popup input fields and reset Caret Position
   * 
   * @memberof CreatorComponent
   */
  hidePopup() {
    this.anchorLink = undefined;
    this.anchorText = undefined;
    this.caretPosition = -1;
    this.isPopupVisible = false;
  }

}

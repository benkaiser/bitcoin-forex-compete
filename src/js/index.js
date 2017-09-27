import { h, render } from 'preact';
import ApplicationView from './application_view';

class Application {
  static initialise() {
    render((<ApplicationView />), document.getElementById('preact'));
  }
}

Application.initialise();

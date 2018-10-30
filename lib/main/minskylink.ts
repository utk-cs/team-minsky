import "atom";
import { CompositeDisposable } from "atom";
import { TextEditor } from "atom";
import { DisplayMarkerLayer } from "atom";

import { test_getComment } from "../github/test";

import { AtomPane } from "./newPaneView.ts"

console.log(String("Loading Minsky Link"));

// HOVER LISTENER GH40
// TODO

// ISSUE TAG FINDER GH33
// search for issue tags in a TextBuffer and apply markers to them
function findIssueTags(
  textToSearch: TextEditor,
  issuetaglayer: DisplayMarkerLayer
) {
  var regex1 = new RegExp(/(GH([0-9]+))/, "gm");

  textToSearch.scan(regex1, scanResult => {
    var issue_number: number = parseInt(scanResult.match[2]);
    console.log("Found issue tag: " + scanResult.matchText);
    // check if there already exists a marker on this layer:
    var existing_markers = issuetaglayer.findMarkers({
      intersectsBufferRange: scanResult.range
    });
    for (var marker_to_check of existing_markers) {
      if (marker_to_check.isValid() == true) {
        // still is valid? don't bother
        console.log(
          "Issue tag #" +
            issue_number +
            " already known: " +
            marker_to_check.getBufferRange()
        );
        return;
      } else {
        // destroy the invalid marker:
        marker_to_check.destroy();
      }
    }
    console.log("Creating marker on " + scanResult.range);
    var new_marker = issuetaglayer.markBufferRange(scanResult.range, {
      invalidate: "touch"
    });
    console.log(
      "Created marker for issue #" +
        issue_number +
        ": " +
        new_marker.getStartBufferPosition
    );
  });

  console.log(
    "issuetaglayer currently has " + issuetaglayer.getMarkerCount() + " items!"
  );
}

// Execute once for every opened editor
atom.workspace.observeTextEditors(editor => {
  console.log("Opening editor: " + editor.getLongTitle());
  console.log("Running scan on " + editor.getLongTitle());

  var issuetaglayer: DisplayMarkerLayer = editor.addMarkerLayer({});
  editor.decorateMarkerLayer(issuetaglayer, {
    type: "highlight",
    class: "minskylink_issue_tag"
  });

  findIssueTags(editor, issuetaglayer);

  // TODO place hook on the buffer being edited:
  editor.onDidStopChanging(event_editorchanged => {
    event_editorchanged.changes.forEach(text_change => {
      // check if the change range is in any of our issue tags.
      console.log("Changed text: " + text_change.oldRange);
    });
    findIssueTags(editor, issuetaglayer);
  });
});

let subscriptions: CompositeDisposable | undefined;

subscriptions = new CompositeDisposable();

// This adds the Active Command to our list of commands in Atom
subscriptions.add(
  atom.commands.add("atom-workspace", {
    "minsky:speaks": () => speaks()
  })
);

subscriptions.add(
  atom.commands.add("atom-workspace", {
    "minsky:testGitHub": () => test_getComment()
  }),

  //Brian's Trash
  //This should create a new pane
  //Else not check out this as an example
  atom.command.add("atom-workspace", {
    "package-name:show-view": () => {
    const view = new AtomPane({
      name: "Brian"
    })
    const panel = atom.workspace.addRightPanel({
      item: view.element
    })
  }})

);

// This is an active command function. You can add more in the
// activate function.
export function speaks(): void {
  console.log("Minsky was asked to Speak!");
}

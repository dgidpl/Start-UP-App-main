function doGet(e) {
    return handleRequest(e);
}
function doPost(e) {
    return handleRequest(e);
}
// --- CONFIGURATION ---
const COMMENTS_SHEET_NAME = "Comments";
// --- SMART SHEET SELECTOR ---
function getMainSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    // 1. Priority: Find a sheet named "Ideas"
    var ideasSheet = ss.getSheetByName("Ideas");
    if (ideasSheet && ideasSheet.getLastRow() > 1) {
        return ideasSheet;
    }
    // 2. Search: Find ANY sheet that has data (more than 1 row) and is not "Comments"
    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var name = sheet.getName();
        if (name !== COMMENTS_SHEET_NAME && sheet.getLastRow() > 1) {
            return sheet;
        }
    }
    // 3. Fallback: If "Ideas" exists (even empty), return it. Otherwise first sheet.
    return ideasSheet || sheets[0];
}
function getCommentsSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
    if (!sheet) {
        sheet = ss.insertSheet(COMMENTS_SHEET_NAME);
        sheet.appendRow(["Date", "IdeaID", "Author", "Content"]);
    }
    return sheet;
}
function handleRequest(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
        var sheet = getMainSheet();
        // Safety check: if sheet is totally empty, add headers
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["Date", "Author", "Phone", "ID", "Content", "Status", "Upvotes", "Downvotes", "Topic"]);
        }
        var action = e.parameter.action;
        var data = e.parameter;
        // Handle POST body
        if (e.postData && e.postData.contents) {
            try {
                var body = JSON.parse(e.postData.contents);
                if (body.action) {
                    action = body.action;
                    data = body;
                }
            } catch (err) { }
        }
        if (action == "getData") {
            return getAllIdeas(sheet);
        }
        else if (action == "create_idea") {
            return createIdea(sheet, data);
        }
        else if (action == "vote") {
            return voteIdea(sheet, data);
        }
        else if (action == "add_comment") {
            return addComment(data);
        }
        else if (action == "get_comments") {
            return getComments(data);
        }
        // Default: return all data
        return getAllIdeas(sheet);
    } catch (error) {
        return responseJSON({ status: "error", message: error.toString() });
    } finally {
        lock.releaseLock();
    }
}
function getAllIdeas(sheet) {
    var data = sheet.getDataRange().getValues();
    var ideas = [];
    // Start loop from 1 to skip Headers
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[3] && !row[4]) continue; // Skip empty rows
        // Structure: 
        // 0: Date, 1: Author, 2: Phone, 3: ID, 4: Content, 5: Status, 6: Up, 7: Down, 8: Topic
        ideas.push({
            date: row[0],
            author: row[1],
            // phone: row[2], // private
            id: row[3],
            content: row[4],
            status: row[5],
            upvotes: row[6],
            downvotes: row[7],
            topic: row[8] || ""
        });
    }
    // Debug info if empty
    if (ideas.length === 0) {
        return responseJSON({
            status: "success",
            data: [],
            debug_sheet: sheet.getName(),
            debug_rows: sheet.getLastRow()
        });
    }
    return responseJSON(ideas);
}
function createIdea(sheet, params) {
    var id = new Date().getTime().toString();
    var date = new Date();
    var author = params.author || "Анонім";
    var phone = params.phone || "";
    var content = params.content;
    var topic = params.topic || "";
    sheet.appendRow([date, author, phone, id, content, "Нова", 0, 0, topic]);
    return responseJSON({ status: "success", id: id });
}
function voteIdea(sheet, params) {
    var id = params.id;
    var type = params.type;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        // Check ID at index 3 (Col D)
        if (data[i][3] == id) {
            var col = (type == 'up') ? 7 : 8; // G=7, H=8
            var cell = sheet.getRange(i + 1, col);
            var val = cell.getValue();
            if (typeof val !== 'number') val = 0;
            cell.setValue(val + 1);
            return responseJSON({ status: "success" });
        }
    }
    return responseJSON({ status: "error", message: "Idea not found" });
}
function addComment(params) {
    var sheet = getCommentsSheet();
    var id = params.ideaId;
    var text = params.text;
    var author = params.author || "Анонім";
    sheet.appendRow([new Date(), id, author, text]);
    return responseJSON({ status: "success" });
}
function getComments(params) {
    var id = params.id;
    var sheet = getCommentsSheet();
    var data = sheet.getDataRange().getValues();
    var comments = [];
    for (var i = 1; i < data.length; i++) {
        if (data[i][1] == id) {
            comments.push({
                date: data[i][0],
                author: data[i][2],
                text: data[i][3]
            });
        }
    }
    return responseJSON(comments);
}
function responseJSON(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

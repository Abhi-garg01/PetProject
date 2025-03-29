$(document).ready(function () {

    $("#txtEmails").blur(function () {

        var exp = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        var email = $("#txtEmails").val();

        if (exp.test(email) == true) {
            $(this).css("border", "1px solid green");
            $("#errEmail").html("Valid");
            //$("#errEmail").removeClass("not-ok-pic").addClass("ok-pic");
        }
        else {
            $(this).css("border", "1px solid red");
            $("#errEmail").html("Please enter your valid Email");
            //$("#errEmail").removeClass("ok-pic").addClass("not-ok-pic");
        }
    });
    //========================================================================
    $("#txtPwds").blur(function () {
        var pass = $("#txtPwds").val();
        var r = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
        if (r.test(pass) == true) {
            $(this).css("border", "1px solid green");
            $("#errPass").html("ok");
        }
        else {
            $(this).css("border", "1px solid red");
            $("#errPass").html("Plz Enter Stong Password");
        }
    });
    //========================================================================

    $(".fa").mousedown(function () {
        $("#txtPwds").prop("type", "text");
        $(".fa").removeClass("bi-eye").addClass("bi-eye-slash");
    });
    $(".fa").mouseup(function () {
        $("#txtPwds").attr("type", "password");
        $(".fa").removeClass("bi-eye").addClass("bi-eye");
    });

    //=======================login validation================================
    $("#txtEmaill").blur(function () {

        var exp = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        var email = $("#txtEmaill").val();

        if (exp.test(email) == true) {
            $(this).removeClass("not-ok").addClass("ok");
            $("#err-Email").html("Valid");
            //$("#errEmail").removeClass("not-ok-pic").addClass("ok-pic");
        }
        else {
            $(this).removeClass("ok").addClass("not-ok");
            $("#err-Email").html("Please enter your valid Email");
            //$("#errEmail").removeClass("ok-pic").addClass("not-ok-pic");
        }
    });
});

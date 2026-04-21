package com.PBL3.Mobile_OnlineShop.Exeption;

import com.PBL3.Mobile_OnlineShop.dto.reponse.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý AppException (các lỗi business logic)
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ErrorResponse response = ErrorResponse.builder()
                .error(ErrorResponse.ErrorDetail.builder()
                        .code(errorCode.getCode())
                        .message(ex.getMessage())
                        .status(errorCode.getHttpStatus().value())
                        .build())
                .build();
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    /**
     * Xử lý lỗi validation (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ErrorResponse response = ErrorResponse.builder()
                .error(ErrorResponse.ErrorDetail.builder()
                        .code(ErrorCode.VALIDATION_ERROR.getCode())
                        .message(message)
                        .status(400)
                        .build())
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Xử lý lỗi chung (fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse response = ErrorResponse.builder()
                .error(ErrorResponse.ErrorDetail.builder()
                        .code(ErrorCode.INTERNAL_ERROR.getCode())
                        .message("Đã xảy ra lỗi hệ thống")
                        .status(500)
                        .build())
                .build();
        return ResponseEntity.internalServerError().body(response);
    }
}

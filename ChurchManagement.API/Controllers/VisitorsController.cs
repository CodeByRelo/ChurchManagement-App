using ChurchManagement.API.DTOs.Visitors;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VisitorsController : ControllerBase
{
    private readonly VisitorService _visitorService;

    public VisitorsController(VisitorService visitorService)
    {
        _visitorService = visitorService;
    }

    // GET: api/Visitors
    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var visitors = await _visitorService.GetAllAsync();

        return Ok(visitors);
    }

    // GET: api/Visitors/5
    [HttpGet("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetById(int id)
    {
        var visitor = await _visitorService.GetByIdAsync(id);

        if (visitor == null)
            return NotFound(new
            {
                message = "Visitor not found."
            });

        return Ok(visitor);
    }

    // POST: api/Visitors
    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> Create(
        [FromBody] CreateVisitorRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var visitor =
            await _visitorService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = visitor.VisitorId },
            visitor);
    }

    // PUT: api/Visitors/5
    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateVisitorRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var visitor =
            await _visitorService.UpdateAsync(id, request);

        if (visitor == null)
            return NotFound(new
            {
                message = "Visitor not found."
            });

        return Ok(visitor);
    }

    // PUT: api/Visitors/5/follow-up
    [HttpPut("{id:int}/follow-up")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> UpdateFollowUp(
        int id,
        [FromBody] UpdateVisitorFollowUpRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var visitor =
                await _visitorService.UpdateFollowUpAsync(
                    id,
                    request);

            if (visitor == null)
                return NotFound(new
                {
                    message = "Visitor not found."
                });

            return Ok(visitor);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // DELETE: api/Visitors/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _visitorService.DeleteAsync(id);

        if (!deleted)
            return NotFound(new
            {
                message = "Visitor not found."
            });

        return NoContent();
    }
}